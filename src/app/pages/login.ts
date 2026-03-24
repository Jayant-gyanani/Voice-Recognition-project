import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans relative">
      <a routerLink="/" class="absolute top-6 left-6 p-2 rounded-full bg-white shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-colors flex items-center justify-center text-zinc-600">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 w-full max-w-md">
        <div class="flex items-center justify-center gap-2 mb-8">
          <mat-icon class="text-indigo-600">record_voice_over</mat-icon>
          <span class="text-xl font-bold tracking-tight">VoiceAuth</span>
        </div>
        
        <h2 class="text-2xl font-bold text-center mb-6 text-zinc-900">Welcome back</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="identifier" class="block text-sm font-medium text-zinc-700 mb-1">Email, Username, or Unique ID</label>
            <input id="identifier" type="text" formControlName="identifier" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Enter your email, username, or ID">
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input id="password" type="password" formControlName="password" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••">
          </div>
          
          @if (error()) {
            <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{{ error() }}</div>
          }
          
          <button type="submit" [disabled]="loginForm.invalid || loading()" class="w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
            @if (loading()) {
              <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon>
            } @else {
              Sign In
            }
          </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-zinc-600">
          Don't have an account? <a routerLink="/signup" class="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loginForm = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.error.set('');
    
    this.http.post<any>('/api/auth/login', this.loginForm.value).subscribe({
      next: (res) => {
        if (res.user.role === 'admin') {
          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('adminUser', JSON.stringify(res.user));
          this.router.navigate(['/admin/dashboard']);
        } else if (res.user.role === 'test') {
          localStorage.setItem('testToken', res.token);
          localStorage.setItem('testUser', JSON.stringify(res.user));
          this.router.navigate(['/test-dashboard']);
        } else {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed');
      }
    });
  }
}
