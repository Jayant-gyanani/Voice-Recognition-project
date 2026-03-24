import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, DatePipe],
  template: `
    <div class="min-h-screen bg-zinc-50 font-sans">
      <header class="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-2">
          <mat-icon class="text-indigo-600">record_voice_over</mat-icon>
          <span class="text-xl font-bold tracking-tight">VoiceAuth</span>
        </div>
        <nav class="flex items-center gap-6">
          <a routerLink="/dashboard" class="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Dashboard</a>
          <a routerLink="/developer" class="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-1">Developer</a>
          <button (click)="showNotifModal.set(true)" class="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 transition-colors relative">
            <mat-icon class="text-sm">notifications</mat-icon> Notifications
            @if (unreadCount() > 0) {
              <span class="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ unreadCount() }}</span>
            }
          </button>
          <button (click)="logout()" class="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 transition-colors">
            <mat-icon class="text-sm">logout</mat-icon> Logout
          </button>
        </nav>
      </header>

      <main class="max-w-5xl mx-auto px-8 py-12">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-bold text-zinc-900 mb-2">Developer Portal</h1>
            <p class="text-zinc-600">Manage your VoiceAuth API integrations.</p>
          </div>
          <button (click)="showCreateModal.set(true)" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <mat-icon>add</mat-icon> Create Integration
          </button>
        </div>

        @if (projects().length === 0) {
          <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 text-center">
            <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-indigo-600 text-4xl">api</mat-icon>
            </div>
            <h2 class="text-2xl font-bold text-zinc-900 mb-2">No projects yet</h2>
            <p class="text-zinc-600 max-w-md mx-auto mb-8">Create your first integration to get an API key and start using VoiceAuth in your applications.</p>
            <button (click)="showCreateModal.set(true)" class="bg-zinc-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors inline-flex items-center gap-2">
              <mat-icon>add</mat-icon> Build API
            </button>
          </div>
        } @else {
          <div class="grid md:grid-cols-2 gap-6">
            @for (project of projects(); track project.id) {
              <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer relative" (click)="goToProject(project.id)">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {{ project.name.charAt(0) }}
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-zinc-900">{{ project.name }}</h3>
                      <p class="text-xs text-zinc-500">{{ project.type }}</p>
                    </div>
                  </div>
                  <div class="relative">
                    <button (click)="$event.stopPropagation(); toggleMenu(project.id)" class="text-zinc-400 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    @if (activeMenu() === project.id) {
                      <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-20">
                        <button (click)="$event.stopPropagation(); goToProject(project.id)" class="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                          <mat-icon class="text-sm">visibility</mat-icon> View Details
                        </button>
                        <button (click)="$event.stopPropagation(); deleteProject(project.id)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <mat-icon class="text-sm">delete</mat-icon> Delete Project
                        </button>
                      </div>
                    }
                  </div>
                </div>
                
                <p class="text-sm text-zinc-600 mb-6 line-clamp-2">{{ project.description }}</p>
                
                <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-200 mb-6" (click)="$event.stopPropagation()">
                  <p class="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">API Key</p>
                  <div class="flex items-center justify-between mb-4">
                    <code class="text-sm font-mono text-zinc-900 bg-white px-2 py-1 rounded border border-zinc-200 truncate mr-2">{{ project.apiKey }}</code>
                    <button (click)="copyToClipboard(project.apiKey)" class="text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0 p-1 rounded hover:bg-indigo-50">
                      <mat-icon class="text-sm">content_copy</mat-icon>
                    </button>
                  </div>
                  <p class="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Project ID</p>
                  <div class="flex items-center justify-between">
                    <code class="text-sm font-mono text-zinc-900 bg-white px-2 py-1 rounded border border-zinc-200 truncate mr-2">{{ project.id }}</code>
                    <button (click)="copyToClipboard(project.id)" class="text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0 p-1 rounded hover:bg-indigo-50">
                      <mat-icon class="text-sm">content_copy</mat-icon>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-zinc-500 border-t border-zinc-100 pt-4">
                  <span class="flex items-center gap-1"><mat-icon class="text-sm">people</mat-icon> {{ project.usersCount || 0 }} users</span>
                  <span class="flex items-center gap-1"><mat-icon class="text-sm">calendar_today</mat-icon> {{ project.createdAt | date:'shortDate' }}</span>
                </div>
              </div>
            }
          </div>
        }
      </main>

      <!-- Create Project Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-zinc-100">
              <h2 class="text-xl font-bold text-zinc-900">Create Integration</h2>
              <button (click)="showCreateModal.set(false)" class="text-zinc-400 hover:text-zinc-900 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <form [formGroup]="projectForm" (ngSubmit)="createProject()" class="p-6 space-y-4">
              <div>
                <label for="appName" class="block text-sm font-medium text-zinc-700 mb-1">Application Name</label>
                <input id="appName" type="text" formControlName="name" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. My Awesome App">
              </div>
              
              <div>
                <label for="appDesc" class="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea id="appDesc" formControlName="description" rows="3" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" placeholder="What does your app do?"></textarea>
              </div>
              
              <div>
                <label for="appType" class="block text-sm font-medium text-zinc-700 mb-1">Project Type</label>
                <select id="appType" formControlName="type" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile App</option>
                  <option value="desktop">Desktop App</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              @if (error()) {
                <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{{ error() }}</div>
              }
              
              <div class="pt-4 flex items-center justify-end gap-3">
                <button type="button" (click)="showCreateModal.set(false)" class="px-6 py-2.5 rounded-xl font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">Cancel</button>
                <button type="submit" [disabled]="projectForm.invalid || loading()" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  @if (loading()) {
                    <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon>
                  } @else {
                    Generate API Key
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showNotifModal()) {
        <div class="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 class="text-lg font-bold text-zinc-900">Access Requests</h3>
              <button (click)="closeNotifModal()" class="text-zinc-400 hover:text-zinc-600 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1">
              @if (developerNotifications().length === 0) {
                <div class="text-center py-8">
                  <mat-icon class="text-zinc-300 text-5xl mb-3">inbox</mat-icon>
                  <p class="text-zinc-500 font-medium">No pending access requests</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (req of developerNotifications(); track req.id) {
                    <div class="p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-start gap-4">
                          <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            {{ req.userName?.charAt(0) || 'U' }}
                          </div>
                          <div>
                            <p class="text-sm font-medium text-zinc-900">
                              <strong>{{ req.userName }}</strong> ({{ req.userEmail }})
                            </p>
                            <p class="text-sm text-zinc-600 mt-1">
                              Requested access to project <strong>{{ req.projectName }}</strong>
                            </p>
                            <p class="text-xs text-zinc-400 mt-2">{{ req.createdAt | date:'medium' }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button (click)="respondToRequest(req.id, 'declined')" [disabled]="respondingId() === req.id" class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                            Decline
                          </button>
                          <button (click)="respondToRequest(req.id, 'granted')" [disabled]="respondingId() === req.id" class="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                            @if (respondingId() === req.id) { <mat-icon class="animate-spin h-4 w-4">autorenew</mat-icon> } Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DeveloperComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  projects = signal<any[]>([]);
  showCreateModal = signal(false);
  loading = signal(false);
  error = signal('');
  activeMenu = signal<string | null>(null);

  // Notifications
  showNotifModal = signal(false);
  developerNotifications = signal<any[]>([]);
  unreadCount = signal(0);
  respondingId = signal<string | null>(null);

  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    type: ['web', Validators.required]
  });

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchProjects();
    this.fetchNotifications();
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
      this.activeMenu.set(null);
    });
  }

  toggleMenu(id: string) {
    this.activeMenu.set(this.activeMenu() === id ? null : id);
  }

  goToProject(id: string) {
    this.router.navigate(['/developer/project', id]);
  }

  deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.http.delete(`/api/developer/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).subscribe({
        next: () => {
          this.projects.update(p => p.filter(proj => proj.id !== id));
          this.activeMenu.set(null);
        },
        error: (err) => console.error('Failed to delete project', err)
      });
    }
  }

  fetchProjects() {
    this.http.get<any[]>('/api/developer/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => this.projects.set(res),
      error: (err) => console.error('Failed to fetch projects', err)
    });
  }

  fetchNotifications() {
    this.http.get<any[]>('/api/notifications/developer', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => {
        this.developerNotifications.set(res);
        this.unreadCount.set(res.length);
      },
      error: (err) => console.error('Failed to fetch developer notifications', err)
    });
  }

  createProject() {
    if (this.projectForm.invalid) return;
    
    this.loading.set(true);
    this.error.set('');
    
    this.http.post<any>('/api/developer/projects', this.projectForm.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => {
        this.projects.update(p => [res, ...p]);
        this.showCreateModal.set(false);
        this.projectForm.reset({ type: 'web' });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to create project');
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // --- Notifications Methods ---
  closeNotifModal() {
    this.showNotifModal.set(false);
  }

  respondToRequest(notificationId: string, status: 'granted' | 'declined') {
    this.respondingId.set(notificationId);
    this.http.post<any>('/api/notifications/respond', {
      notificationId,
      status
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: () => {
        this.respondingId.set(null);
        this.fetchNotifications(); // Refresh list
      },
      error: (err) => {
        console.error('Failed to respond to request', err);
        this.respondingId.set(null);
        alert('Failed to respond to request.');
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
