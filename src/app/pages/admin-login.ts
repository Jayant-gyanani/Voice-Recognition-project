import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-zinc-900 flex items-center justify-center p-4 font-sans">
      <div class="bg-zinc-800 p-8 rounded-2xl shadow-xl border border-zinc-700 w-full max-w-md">
        <div class="flex items-center justify-center gap-2 mb-8">
          <mat-icon class="text-indigo-500">admin_panel_settings</mat-icon>
          <span class="text-xl font-bold tracking-tight text-white">Admin Portal</span>
        </div>
        
        <h2 class="text-2xl font-bold text-center mb-6 text-white">Admin Login</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-zinc-300 mb-1">Username</label>
            <input id="username" type="text" formControlName="username" class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white" placeholder="admin">
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input id="password" type="password" formControlName="password" class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white" placeholder="••••••••">
          </div>
          
          @if (error()) {
            <div class="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg border border-red-800">{{ error() }}</div>
          }
          
          <button type="submit" [disabled]="loginForm.invalid || loading()" class="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
            @if (loading()) {
              <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon>
            } @else {
              Sign In
            }
          </button>
        </form>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.error.set('');
    
    this.http.post<any>('/api/admin/login', this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.user));
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed');
        this.loading.set(false);
      }
    });
  }
}
