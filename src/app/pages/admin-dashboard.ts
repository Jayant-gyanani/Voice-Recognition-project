import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatIconModule, DatePipe, ReactiveFormsModule, JsonPipe],
  template: `
    <div class="min-h-screen bg-zinc-50 font-sans">
      <header class="bg-zinc-900 text-white border-b border-zinc-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-2">
          <mat-icon class="text-indigo-400">admin_panel_settings</mat-icon>
          <span class="text-xl font-bold tracking-tight">Admin Portal</span>
        </div>
        <nav class="flex items-center gap-6">
          <button (click)="activeTab.set('users')" [class.text-indigo-400]="activeTab() === 'users'" [class.border-indigo-400]="activeTab() === 'users'" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors border-b-2 border-transparent pb-1">Users List</button>
          <button (click)="activeTab.set('voice')" [class.text-indigo-400]="activeTab() === 'voice'" [class.border-indigo-400]="activeTab() === 'voice'" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors border-b-2 border-transparent pb-1">Voice Detection</button>
          <button (click)="logout()" class="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-1 transition-colors ml-4">
            <mat-icon class="text-sm">logout</mat-icon> Logout
          </button>
        </nav>
      </header>

      <main class="max-w-6xl mx-auto px-8 py-12">
        @if (activeTab() === 'users') {
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-zinc-900">All Users</h1>
              <p class="text-zinc-500">Manage all registered users on the platform.</p>
            </div>
            <div class="bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-2">
              <mat-icon class="text-zinc-400">people</mat-icon>
              <span class="font-bold text-zinc-900">{{ users().length }}</span>
              <span class="text-zinc-500 text-sm">Total Users</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500 uppercase tracking-wider">
                  <th class="p-4 font-medium">User</th>
                  <th class="p-4 font-medium">Unique ID</th>
                  <th class="p-4 font-medium">Email</th>
                  <th class="p-4 font-medium">Joined</th>
                  <th class="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-zinc-50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        @if (user.photo) {
                          <img [src]="user.photo" alt="User Photo" class="w-10 h-10 rounded-full object-cover border border-zinc-200">
                        } @else {
                          <div class="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                            {{ user.name.charAt(0) }}
                          </div>
                        }
                        <div>
                          <p class="font-bold text-zinc-900">{{ user.name }}</p>
                          <p class="text-xs text-zinc-500 capitalize">{{ user.gender }} • {{ user.age || 'N/A' }} yrs</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <code class="text-xs font-mono text-zinc-600 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">{{ user.id }}</code>
                    </td>
                    <td class="p-4 text-sm text-zinc-600">{{ user.email }}</td>
                    <td class="p-4 text-sm text-zinc-500">{{ user.createdAt | date:'mediumDate' }}</td>
                    <td class="p-4 text-right relative">
                      <button (click)="$event.stopPropagation(); toggleMenu(user.id)" class="text-zinc-400 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      @if (activeMenu() === user.id) {
                        <div class="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-20 text-left">
                          <button (click)="$event.stopPropagation(); deleteUser(user.id)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <mat-icon class="text-sm">delete</mat-icon> Delete Account
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
                @if (users().length === 0) {
                  <tr>
                    <td colspan="5" class="p-8 text-center text-zinc-500">No users found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeTab() === 'voice') {
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-zinc-900">Voice Detection Test</h1>
            <p class="text-zinc-500">Record a voice sample to search the entire database and recognize the user.</p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <h2 class="text-lg font-bold text-zinc-900 mb-4">Voice Input</h2>

                <div class="bg-zinc-50 rounded-xl p-6 border border-zinc-200 text-center">
                  <p class="text-sm text-zinc-600 mb-4">Please read the following text clearly:</p>
                  <p class="text-lg font-medium text-zinc-900 italic mb-8">"My voice is my password, verify me."</p>
                  
                  <button 
                    (click)="toggleRecording()" 
                    [disabled]="processing()"
                    [class.bg-red-500]="isRecording()"
                    [class.hover:bg-red-600]="isRecording()"
                    [class.bg-indigo-600]="!isRecording()"
                    [class.hover:bg-indigo-700]="!isRecording()"
                    class="w-24 h-24 rounded-full text-white shadow-lg transition-all flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed">
                    <mat-icon class="text-4xl">{{ isRecording() ? 'stop' : 'mic' }}</mat-icon>
                  </button>
                  <p class="text-sm font-medium mt-4" [class.text-red-500]="isRecording()" [class.text-zinc-500]="!isRecording()">
                    {{ isRecording() ? 'Recording... ' + recordingTimeLeft() + 's left' : 'Click to record' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 h-full flex flex-col">
                <h2 class="text-lg font-bold text-zinc-900 mb-4">Detection Result</h2>
                
                @if (processing()) {
                  <div class="flex-1 flex flex-col items-center justify-center text-zinc-500">
                    <mat-icon class="animate-spin text-indigo-600 text-4xl mb-4">autorenew</mat-icon>
                    <p>Analyzing voice sample...</p>
                  </div>
                } @else if (detectResult()) {
                  <div class="flex-1">
                    <div class="mb-6 p-4 rounded-xl border" 
                         [class.bg-emerald-50]="detectResult()?.status === 'success'"
                         [class.border-emerald-200]="detectResult()?.status === 'success'"
                         [class.text-emerald-800]="detectResult()?.status === 'success'"
                         [class.bg-red-50]="detectResult()?.status === 'not_allowed' || detectResult()?.status === 'not_registered'"
                         [class.border-red-200]="detectResult()?.status === 'not_allowed' || detectResult()?.status === 'not_registered'"
                         [class.text-red-800]="detectResult()?.status === 'not_allowed' || detectResult()?.status === 'not_registered'">
                      <div class="flex items-center gap-2 mb-1">
                        <mat-icon>{{ detectResult()?.status === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                        <span class="font-bold capitalize">{{ detectResult()?.status.replace('_', ' ') }}</span>
                      </div>
                      <p class="text-sm">{{ detectResult()?.message }}</p>
                    </div>

                    <h3 class="text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">API Response Data</h3>
                    <div class="bg-zinc-900 rounded-xl p-4 overflow-auto max-h-64">
                      <pre class="text-xs font-mono text-emerald-400">{{ detectResult()?.data | json }}</pre>
                    </div>
                  </div>
                } @else {
                  <div class="flex-1 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                    <mat-icon class="text-4xl mb-2">graphic_eq</mat-icon>
                    <p>Record a voice sample to see results</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  activeTab = signal<'users' | 'voice'>('users');
  users = signal<any[]>([]);
  activeMenu = signal<string | null>(null);

  apiKeyControl = this.fb.control('', Validators.required);
  
  isRecording = signal(false);
  processing = signal(false);
  detectResult = signal<any>(null);
  recordingTimeLeft = signal(7);
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerInterval: any;

  ngOnInit() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.fetchUsers();
    
    document.addEventListener('click', () => {
      this.activeMenu.set(null);
    });
  }

  ngOnDestroy() {
    if (this.isRecording() && this.mediaRecorder) {
      this.mediaRecorder.stop();
      clearInterval(this.timerInterval);
    }
  }

  fetchUsers() {
    this.http.get<any[]>('/api/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    }).subscribe({
      next: (res) => this.users.set(res),
      error: (err) => {
        console.error('Failed to fetch users', err);
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  toggleMenu(id: string) {
    this.activeMenu.set(this.activeMenu() === id ? null : id);
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      this.http.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      }).subscribe({
        next: () => {
          this.users.update(u => u.filter(user => user.id !== id));
          this.activeMenu.set(null);
        },
        error: (err) => console.error('Failed to delete user', err)
      });
    }
  }

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.processVoiceSample(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.detectResult.set(null);
      this.recordingTimeLeft.set(7);
      
      this.timerInterval = setInterval(() => {
        this.recordingTimeLeft.update(v => v - 1);
        if (this.recordingTimeLeft() <= 0) {
          this.stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      clearInterval(this.timerInterval);
    }
  }

  processVoiceSample(blob: Blob) {
    this.processing.set(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      this.http.post<any>('/api/admin/voice-detect', {
        voiceSample: base64Audio
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      }).subscribe({
        next: (res) => {
          this.detectResult.set(res);
          this.processing.set(false);
        },
        error: (err) => {
          console.error('Voice detection failed', err);
          this.detectResult.set({
            status: 'error',
            message: err.error?.message || 'An error occurred during detection',
            data: null
          });
          this.processing.set(false);
        }
      });
    };
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/']);
  }
}
