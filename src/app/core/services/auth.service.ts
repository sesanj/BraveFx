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

      // Handle email confirmation events
      if (event === 'USER_UPDATED' && session?.user) {
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

      const { data: profile, error } = await this.supabaseService.client
        .from('profiles')
        .select('id, email, full_name, avatar_url, is_admin, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!profile) {
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
    } catch (error) {
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
          throw error;
        }
        if (!data.user) {
          throw new Error('Registration failed');
        }

        // Check if user already exists
        // Supabase returns a user object but with empty identities array if email exists
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error(
            'This email is already registered. Please login instead.'
          );
        }

        // If there's no session (email confirmation required),
        // we can't load the profile due to RLS
        if (!data.session) {
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
          return this.currentUserSubject.value;
        }
        throw new Error('Profile not loaded');
      }),
      catchError((error) => {
        if (maxRetries > 0) {
          return from(new Promise((resolve) => setTimeout(resolve, 1000))).pipe(
            switchMap(() => this.loadProfileWithRetry(userId, maxRetries - 1))
          );
        }
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

      if (authError) {
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

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Reload user profile to get updated data
      await this.loadUserProfile(user.id);
    } catch (error: any) {
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
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
        throw error;
      }

      // Password is correct - sign in succeeded
      // Note: This creates a new session, but that's okay since the user is already logged in
    } catch (error: any) {
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
        throw new Error('Failed to delete account: ' + error.message);
      }

      // Sign out to clear session and remove tokens from storage
      await this.supabaseService.client.auth.signOut();

      // Clear the current user
      this.currentUserSubject.next(null);

      // Navigate to login
      this.router.navigate(['/login']);
    } catch (error: any) {
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
        throw new Error(error.message);
      }
    } catch (error: any) {
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
        return { data: false, error: error.message };
      }
      return { data: !!data };
    } catch (error: any) {
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
      throw error;
    }
  }
}
