import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Dummy data - simulating logged in user
  private dummyUser: User = {
    id: '1',
    email: 'student@bravefx.com',
    name: 'John Doe',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    createdAt: new Date('2024-01-15'),
  };

  constructor() {
    // Simulate logged in user for development
    this.currentUserSubject.next(this.dummyUser);
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
    // Dummy login - will be replaced with real auth later
    return new Observable((observer) => {
      setTimeout(() => {
        this.currentUserSubject.next(this.dummyUser);
        observer.next(this.dummyUser);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  register(email: string, password: string, name: string): Observable<User> {
    // Dummy registration
    return new Observable((observer) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role: 'student',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          createdAt: new Date(),
        };
        this.currentUserSubject.next(newUser);
        observer.next(newUser);
        observer.complete();
      }, 1000);
    });
  }
}
