import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authInitialized = false;
  private initPromise: Promise<void>;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Listen to Supabase auth state changes
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event, session?.user?.email);

      // Handle email confirmation events
      if (event === 'USER_UPDATED' && session?.user) {
        console.log('User updated, reloading profile...');
        this.loadUserProfile(session.user.id);
      } else if (session?.user) {
        this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
      }
    });

    // Check if user is already logged in
    this.initPromise = this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const {
        data: { user },
      } = await this.supabaseService.client.auth.getUser();
      if (user) {
        await this.loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      this.authInitialized = true;
    }
  }

  async waitForAuthInit(): Promise<void> {
    if (this.authInitialized) {
      return Promise.resolve();
    }
    return this.initPromise;
  }

  private async loadUserProfile(userId: string) {
    try {
      console.log('Attempting to load profile for user:', userId);

      const { data: profile, error } = await this.supabaseService.client
        .from('profiles')
        .select('id, email, full_name, avatar_url, is_admin, created_at')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile query result:', { profile, error });

      if (error) {
        console.error('Error loading profile:', error);
        throw error;
      }

      if (!profile) {
        console.warn('No profile found for user:', userId);
        throw new Error('Profile not found in database');
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || 'User',
        role: profile.is_admin ? 'admin' : 'student',
        avatar:
          profile.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
        createdAt: new Date(profile.created_at),
      };
      this.currentUserSubject.next(user);
      console.log('Profile loaded successfully:', user);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return from(
      this.supabaseService.client.auth.signInWithPassword({
        email,
        password,
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        if (!data.user) throw new Error('Login failed');

        return from(this.loadUserProfile(data.user.id)).pipe(
          map(() => this.currentUserSubject.value!)
        );
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  register(email: string, password: string, name: string): Observable<User> {
    return from(
      this.supabaseService.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          console.error('Supabase signUp error:', error);
          throw error;
        }
        if (!data.user) {
          console.error('No user returned from signUp');
          throw new Error('Registration failed');
        }

        console.log('User created:', data.user.id);
        console.log('Session created:', !!data.session);
        console.log('User identities:', data.user.identities);

        // Check if user already exists
        // Supabase returns a user object but with empty identities array if email exists
        if (data.user.identities && data.user.identities.length === 0) {
          console.error('User already exists');
          throw new Error(
            'This email is already registered. Please login instead.'
          );
        }

        console.log('Profile will be auto-created by database trigger');

        // If there's no session (email confirmation required),
        // we can't load the profile due to RLS
        if (!data.session) {
          console.warn('No session - email confirmation required');
          // Return a placeholder user for now
          const tempUser: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: name,
            role: 'student',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            createdAt: new Date(),
          };
          return from([tempUser]);
        }

        // If session exists, we can load the profile
        return this.loadProfileWithRetry(data.user.id, 3);
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  private loadProfileWithRetry(
    userId: string,
    maxRetries: number
  ): Observable<User> {
    return from(this.loadUserProfile(userId)).pipe(
      map(() => {
        if (this.currentUserSubject.value) {
          console.log('Profile loaded successfully');
          return this.currentUserSubject.value;
        }
        throw new Error('Profile not loaded');
      }),
      catchError((error) => {
        if (maxRetries > 0) {
          console.log(`Retrying profile load... (${maxRetries} attempts left)`);
          return from(new Promise((resolve) => setTimeout(resolve, 1000))).pipe(
            switchMap(() => this.loadProfileWithRetry(userId, maxRetries - 1))
          );
        }
        console.error('Failed to load profile after all retries');
        throw error;
      })
    );
  }

  async updateUserProfile(name: string, email: string): Promise<void> {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      // Check if email is changing
      const isEmailChanging = email !== user.email;

      console.log('Updating profile:', { name, email, isEmailChanging });

      // Update auth user metadata and email (this updates auth.users table)
      const updateData: any = {
        data: {
          full_name: name,
        },
      };

      // If email is changing, include it in the auth update
      if (isEmailChanging) {
        updateData.email = email;
      }

      const { data: authData, error: authError } =
        await this.supabaseService.client.auth.updateUser(updateData);

      console.log('Auth update result:', { authData, authError });

      if (authError) {
        console.error('Error updating auth user:', authError);
        throw new Error(authError.message);
      }

      // Update profile in database
      // Only update full_name immediately
      // Email will be synced by trigger after confirmation (or immediately if no confirmation required)
      const profileUpdate: any = {
        full_name: name,
        updated_at: new Date().toISOString(),
      };

      // Only update email in profiles if it's NOT changing
      // If changing, the trigger will handle it after email confirmation
      if (!isEmailChanging) {
        profileUpdate.email = email;
      }

      const { error: profileError } = await this.supabaseService.client
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      console.log('Profile update result:', { profileError });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw new Error(profileError.message);
      }

      // Reload user profile to get updated data
      await this.loadUserProfile(user.id);
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Failed to update password:', error);
      throw error;
    }
  }

  async verifyCurrentPassword(email: string, password: string): Promise<void> {
    try {
      // Attempt to sign in with the current credentials to verify password
      const { error } =
        await this.supabaseService.client.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        console.error('Password verification failed:', error);
        throw error;
      }

      // Password is correct - sign in succeeded
      // Note: This creates a new session, but that's okay since the user is already logged in
      console.log('Current password verified successfully');
    } catch (error: any) {
      console.error('Failed to verify current password:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      // Call the database function to delete the user
      // This function has elevated privileges (SECURITY DEFINER) to delete from auth.users
      const { error } = await this.supabaseService.client.rpc('delete_user');

      if (error) {
        console.error('Error deleting account:', error);
        throw new Error('Failed to delete account: ' + error.message);
      }

      console.log('Account deleted successfully, cleaning up...');

      // Sign out to clear session and remove tokens from storage
      await this.supabaseService.client.auth.signOut();

      // Clear the current user
      this.currentUserSubject.next(null);

      // Navigate to login
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } =
        await this.supabaseService.client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (error) {
        console.error('Error sending password reset:', error);
        throw new Error(error.message);
      }

      console.log('Password reset email sent successfully');
    } catch (error: any) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async checkEmailExists(
    email: string
  ): Promise<{ data: boolean; error?: string }> {
    try {
      // Normalize email to lowercase for case-insensitive comparison
      const normalizedEmail = email.toLowerCase().trim();

      // Try to check if email exists in profiles table (case-insensitive)
      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .select('email')
        .ilike('email', normalizedEmail) // Case-insensitive match
        .maybeSingle();

      if (error) {
        console.error('Error checking email:', error);
        return { data: false, error: error.message };
      }

      console.log(
        '📧 [AuthService] Email check result for',
        normalizedEmail,
        ':',
        !!data
      );
      return { data: !!data };
    } catch (error: any) {
      console.error('Failed to check email:', error);
      return { data: false, error: error.message };
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const { data, error } =
        await this.supabaseService.client.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      await this.loadUserProfile(data.user.id);
      return this.currentUserSubject.value!;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
}
