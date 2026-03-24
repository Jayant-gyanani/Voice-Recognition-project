import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe, ReactiveFormsModule],
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
        <div class="mb-8">
          <a routerLink="/developer" class="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-4">
            <mat-icon class="text-sm">arrow_back</mat-icon> Back to Projects
          </a>
          
          @if (project()) {
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-3xl">
                  {{ project()?.name?.charAt(0) }}
                </div>
                <div>
                  <h1 class="text-3xl font-bold text-zinc-900">{{ project()?.name }}</h1>
                  <p class="text-zinc-500">{{ project()?.type }} • Created {{ project()?.createdAt | date }}</p>
                </div>
              </div>
            </div>
          }
        </div>

        @if (project()) {
          <div class="grid md:grid-cols-3 gap-8">
            <div class="md:col-span-1 space-y-6">
              <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <h3 class="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Project Details</h3>
                <p class="text-sm text-zinc-600 mb-6">{{ project()?.description }}</p>
                
                <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                  <p class="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">API Key</p>
                  <div class="flex items-center justify-between">
                    <code class="text-sm font-mono text-zinc-900 bg-white px-2 py-1 rounded border border-zinc-200 truncate mr-2">{{ project()?.apiKey }}</code>
                    <button (click)="copyToClipboard(project()?.apiKey)" class="text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0 p-1 rounded hover:bg-indigo-50">
                      <mat-icon class="text-sm">content_copy</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="bg-zinc-50 rounded-xl p-4 border border-zinc-200 mt-4">
                  <p class="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Project ID</p>
                  <div class="flex items-center justify-between">
                    <code class="text-sm font-mono text-zinc-900 bg-white px-2 py-1 rounded border border-zinc-200 truncate mr-2">{{ project()?.id }}</code>
                    <button (click)="copyToClipboard(project()?.id)" class="text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0 p-1 rounded hover:bg-indigo-50">
                      <mat-icon class="text-sm">content_copy</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="md:col-span-2 space-y-6">
              <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h2 class="text-xl font-bold text-zinc-900">Allowed Users</h2>
                    <p class="text-sm text-zinc-500">Manage users who can authenticate with this app.</p>
                  </div>
                </div>
                
                <form [formGroup]="addUserForm" (ngSubmit)="addUser()" class="flex gap-3 mb-6">
                  <div class="flex-1">
                    <input type="text" formControlName="userId" placeholder="Enter User's Unique ID (e.g. VRU_...)" class="w-full px-4 py-2.5 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  </div>
                  <button type="submit" [disabled]="addUserForm.invalid || addingUser()" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                    @if (addingUser()) { <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon> }
                    <mat-icon>person_add</mat-icon> Add User
                  </button>
                </form>

                <div class="mb-8 relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">search</mat-icon>
                  <input type="text" (input)="updateSearch($event)" placeholder="Search users by name or ID..." class="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                </div>
                
                @if (addError()) {
                  <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 mb-6">{{ addError() }}</div>
                }
                @if (addSuccess()) {
                  <div class="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-6">{{ addSuccess() }}</div>
                }
                
                <div class="space-y-3">
                  @if (filteredUsers().length === 0) {
                    <div class="text-center py-8 border border-dashed border-zinc-200 rounded-xl">
                      <p class="text-zinc-500">No users found.</p>
                    </div>
                  } @else {
                    @for (u of filteredUsers(); track u.id) {
                      <div class="flex items-center justify-between p-4 border border-zinc-200 rounded-xl hover:border-indigo-200 transition-colors relative">
                        <div class="flex items-center gap-4">
                          @if (u.photo) {
                            <img [src]="u.photo" alt="User Photo" class="w-10 h-10 rounded-full object-cover border border-zinc-200">
                          } @else {
                            <div class="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold">
                              {{ u.name.charAt(0) }}
                            </div>
                          }
                          <div>
                            <p class="font-semibold text-zinc-900">{{ u.name }}</p>
                            <p class="text-xs text-zinc-500 font-mono">{{ u.id }}</p>
                          </div>
                        </div>
                        
                        <div class="relative">
                          <button (click)="$event.stopPropagation(); toggleMenu(u.id)" class="text-zinc-400 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          @if (activeMenu() === u.id) {
                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-20">
                              <button (click)="$event.stopPropagation(); removeUser(u.id)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <mat-icon class="text-sm">block</mat-icon> Remove Access
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="flex justify-center py-20">
            <mat-icon class="animate-spin text-indigo-600 text-4xl">autorenew</mat-icon>
          </div>
        }
      </main>

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
export class ProjectDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  projectId = signal<string | null>(null);
  project = signal<any>(null);
  users = signal<any[]>([]);
  
  searchQuery = signal('');
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allUsers = this.users();
    if (!query) return allUsers;
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.id.toLowerCase().includes(query)
    );
  });
  
  activeMenu = signal<string | null>(null);
  
  addUserForm = this.fb.group({
    userId: ['', Validators.required]
  });
  
  addingUser = signal(false);
  addError = signal('');
  addSuccess = signal('');

  // Notifications
  showNotifModal = signal(false);
  developerNotifications = signal<any[]>([]);
  unreadCount = signal(0);
  respondingId = signal<string | null>(null);

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.projectId.set(this.route.snapshot.paramMap.get('id'));
    if (this.projectId()) {
      this.fetchProjectDetails();
      this.fetchUsers();
    }
    
    this.fetchNotifications();
    
    document.addEventListener('click', () => {
      this.activeMenu.set(null);
    });
  }

  fetchProjectDetails() {
    this.http.get<any>(`/api/developer/projects/${this.projectId()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => this.project.set(res),
      error: (err) => {
        console.error('Failed to fetch project', err);
        this.router.navigate(['/developer']);
      }
    });
  }

  fetchUsers() {
    this.http.get<any[]>(`/api/developer/projects/${this.projectId()}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => this.users.set(res),
      error: (err) => console.error('Failed to fetch users', err)
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

  addUser() {
    if (this.addUserForm.invalid) return;
    
    this.addingUser.set(true);
    this.addError.set('');
    this.addSuccess.set('');
    
    this.http.post<any>(`/api/developer/projects/${this.projectId()}/users`, this.addUserForm.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => {
        this.addingUser.set(false);
        this.addSuccess.set(res.message);
        this.addUserForm.reset();
        this.fetchUsers();
        
        setTimeout(() => this.addSuccess.set(''), 3000);
      },
      error: (err) => {
        this.addingUser.set(false);
        this.addError.set(err.error?.message || 'Failed to add user');
      }
    });
  }

  removeUser(userId: string) {
    if (confirm('Are you sure you want to remove access for this user?')) {
      this.http.delete(`/api/developer/projects/${this.projectId()}/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).subscribe({
        next: () => {
          this.users.update(u => u.filter(user => user.id !== userId));
          this.activeMenu.set(null);
        },
        error: (err) => console.error('Failed to remove user', err)
      });
    }
  }

  toggleMenu(id: string) {
    this.activeMenu.set(this.activeMenu() === id ? null : id);
  }

  updateSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  copyToClipboard(text: string) {
    if (text) {
      navigator.clipboard.writeText(text);
    }
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
        if (status === 'granted') {
          this.fetchUsers(); // Refresh allowed users list
        }
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
