import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeToggleComponent } from '../components/theme-toggle';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe, ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
      <header class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <div class="flex items-center gap-2">
          <mat-icon class="text-indigo-600 dark:text-purple-500">record_voice_over</mat-icon>
          <span class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">VoiceAuth</span>
        </div>
        <nav class="flex items-center gap-6">
          <app-theme-toggle></app-theme-toggle>
          <a routerLink="/dashboard" class="text-sm font-medium text-indigo-600 dark:text-purple-400 border-b-2 border-indigo-600 dark:border-purple-500 pb-1">Dashboard</a>
          <a routerLink="/developer" class="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Developer</a>
          <button (click)="showNotifModal.set(true)" class="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors relative">
            <mat-icon class="text-sm">notifications</mat-icon> Notifications
            @if (unreadCount() > 0) {
              <span class="absolute -top-1 -right-2 bg-red-500 dark:bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ unreadCount() }}</span>
            }
          </button>
          <button (click)="logout()" class="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors">
            <mat-icon class="text-sm">logout</mat-icon> Logout
          </button>
        </nav>
      </header>

      <main class="max-w-5xl mx-auto px-8 py-12">
        <div class="mb-10 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Welcome back, {{ user()?.name }}</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Manage your voice profile and connected applications.</p>
          </div>
          <button (click)="openRequestModal()" class="bg-indigo-600 dark:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
            <mat-icon class="text-sm">link</mat-icon> Request Connection
          </button>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="md:col-span-1">
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sticky top-24 transition-colors duration-300">
              <div class="flex justify-center mb-6">
                @if (user()?.photo) {
                  <img [src]="user()?.photo" alt="User Photo" class="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 dark:border-purple-900/30">
                } @else {
                  <div class="w-24 h-24 bg-indigo-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-purple-400 text-3xl font-bold uppercase">
                    {{ user()?.name?.charAt(0) }}
                  </div>
                }
              </div>
              
              <div class="text-center mb-6">
                <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ user()?.name }}</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ user()?.email }}</p>
              </div>
              
              <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 mb-6 transition-colors duration-300">
                <p class="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold mb-1">Your Unique ID</p>
                <div class="flex items-center justify-between">
                  <code class="text-sm font-mono text-indigo-600 dark:text-purple-400 font-bold">{{ user()?.id }}</code>
                  <button (click)="copyId()" class="text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-purple-400 transition-colors">
                    <mat-icon class="text-sm">content_copy</mat-icon>
                  </button>
                </div>
              </div>
              
              <div class="space-y-3">
                <button (click)="openEditProfile()" class="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <span class="flex items-center gap-2"><mat-icon class="text-zinc-400 dark:text-zinc-500">edit</mat-icon> Edit Profile</span>
                </button>
                <button (click)="openRetrainVoice()" class="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <span class="flex items-center gap-2"><mat-icon class="text-zinc-400 dark:text-zinc-500">mic</mat-icon> Retrain Voice Model</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="md:col-span-2 space-y-8">
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 transition-colors duration-300">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <mat-icon class="text-indigo-600 dark:text-purple-500">apps</mat-icon> Connected Applications
                </h3>
              </div>
              
              @if (apps().length === 0) {
                <div class="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <mat-icon class="text-zinc-300 dark:text-zinc-600 text-5xl mb-3">link_off</mat-icon>
                  <p class="text-zinc-500 dark:text-zinc-400 font-medium">No applications connected yet.</p>
                  <p class="text-sm text-zinc-400 dark:text-zinc-500 mt-1">When you use VoiceAuth on other sites, they will appear here.</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (app of apps(); track app.id) {
                    <div class="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-indigo-200 dark:hover:border-purple-500/50 transition-colors">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-indigo-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-purple-400">
                          <mat-icon>api</mat-icon>
                        </div>
                        <div>
                          <p class="font-semibold text-zinc-900 dark:text-zinc-100">{{ app.name }}</p>
                          <p class="text-xs text-zinc-500 dark:text-zinc-400">Connected on {{ app.connectedAt | date }}</p>
                        </div>
                      </div>
                      <button class="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
            
            <div class="bg-indigo-600 dark:bg-purple-700 rounded-2xl shadow-sm p-8 text-white relative overflow-hidden transition-colors duration-300">
              <div class="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <mat-icon style="font-size: 200px; width: 200px; height: 200px;">code</mat-icon>
              </div>
              <div class="relative z-10">
                <h3 class="text-2xl font-bold mb-2">Are you a developer?</h3>
                <p class="text-indigo-100 dark:text-purple-100 mb-6 max-w-md">Integrate VoiceAuth into your own applications. Generate API keys, manage projects, and view analytics.</p>
                <a routerLink="/developer" class="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-purple-400 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50 dark:hover:bg-zinc-800 transition-colors">
                  Go to Developer Portal <mat-icon>arrow_forward</mat-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Edit Profile Modal -->
      @if (showEditProfile()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-xl transition-colors duration-300">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Profile</h2>
              <button (click)="closeEditProfile()" class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form [formGroup]="editProfileForm" (ngSubmit)="saveProfile()" class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                <input id="name" type="text" formControlName="name" class="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none">
              </div>
              <div>
                <label for="gender" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Gender</label>
                <select id="gender" formControlName="gender" class="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label for="dob" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date of Birth</label>
                <input id="dob" type="date" formControlName="dob" class="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none">
              </div>
              <div>
                <label for="photo" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Profile Photo</label>
                <div class="flex items-center gap-4">
                  @if (editPhotoBase64() || user()?.photo) {
                    <img [src]="editPhotoBase64() || user()?.photo" alt="Profile Photo" class="w-12 h-12 rounded-full object-cover border border-zinc-300 dark:border-zinc-700">
                  }
                  <input id="photo" type="file" accept="image/*" (change)="onEditPhotoSelected($event)" class="text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-purple-900/30 file:text-indigo-700 dark:file:text-purple-400 hover:file:bg-indigo-100 dark:hover:file:bg-purple-900/50">
                </div>
              </div>
              <div class="pt-4 flex justify-end gap-3">
                <button type="button" (click)="closeEditProfile()" class="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" [disabled]="editProfileForm.invalid || savingProfile()" class="px-4 py-2 bg-indigo-600 dark:bg-purple-600 text-white font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  @if (savingProfile()) { <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon> } Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Retrain Voice Modal -->
      @if (showRetrainVoice()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Retrain Voice Model</h2>
              <button (click)="closeRetrainVoice()" class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <div class="text-left">
              <p class="text-zinc-600 dark:text-zinc-400 mb-6">Please record 3 samples of your voice saying the following sentences:</p>
              
              <div class="space-y-4">
                @for (sentence of sentences; track $index) {
                  <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm transition-colors duration-300">
                    <p class="text-sm text-zinc-700 dark:text-zinc-300 font-medium italic mb-4">"{{ sentence }}"</p>
                    
                    <div class="flex items-center gap-4">
                      <button type="button" 
                        (click)="toggleRecording($index)" 
                        [disabled]="recordingIndex() !== null && recordingIndex() !== $index"
                        [class.bg-red-500]="recordingIndex() === $index" 
                        [class.text-white]="recordingIndex() === $index" 
                        [class.bg-white]="recordingIndex() !== $index" 
                        [class.dark:bg-zinc-800]="recordingIndex() !== $index" 
                        [class.text-zinc-900]="recordingIndex() !== $index" 
                        [class.dark:text-zinc-100]="recordingIndex() !== $index" 
                        class="border border-zinc-300 dark:border-zinc-600 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors disabled:opacity-50 shadow-sm">
                        <mat-icon>{{ recordingIndex() === $index ? 'stop' : 'mic' }}</mat-icon>
                        {{ recordingIndex() === $index ? 'Recording (' + recordingTimeLeft() + 's)' : (voiceSamples()[$index] ? 'Re-record' : 'Record') }}
                      </button>
                      
                      @if (voiceSamples()[$index] && recordingIndex() !== $index) {
                        <div class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <mat-icon class="text-sm">check_circle</mat-icon> Recorded
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
              
              @if (recordingError()) {
                <p class="text-sm text-red-500 dark:text-red-400 mt-4">{{ recordingError() }}</p>
              }
              
              <div class="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                <button type="button" (click)="closeRetrainVoice()" class="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                <button type="button" (click)="saveVoiceModel()" [disabled]="!allVoicesRecorded() || savingVoice()" class="px-4 py-2 bg-indigo-600 dark:bg-purple-600 text-white font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  @if (savingVoice()) { <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon> } Update Model
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      @if (showRequestModal()) {
        <div class="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-colors duration-300">
            <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Request Connection</h3>
              <button (click)="closeRequestModal()" class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <div class="p-6">
              @if (requestStep() === 1) {
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Enter the unique Project ID to request access.</p>
                <input type="text" [formControl]="requestProjectIdControl" placeholder="PRJ_..." class="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none font-mono text-sm mb-4">
                @if (requestError()) {
                  <p class="text-sm text-red-500 dark:text-red-400 mb-4">{{ requestError() }}</p>
                }
                <div class="flex justify-end gap-3">
                  <button (click)="closeRequestModal()" class="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                  <button (click)="checkProject()" [disabled]="!requestProjectIdControl.value || requesting()" class="px-4 py-2 bg-indigo-600 dark:bg-purple-600 text-white font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    @if (requesting()) { <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon> } Next
                  </button>
                </div>
              } @else if (requestStep() === 2) {
                <div class="bg-indigo-50 dark:bg-purple-900/30 text-indigo-900 dark:text-purple-100 p-4 rounded-xl mb-6">
                  <p class="text-sm font-medium mb-1">Project Found:</p>
                  <p class="text-lg font-bold">{{ requestProjectName() }}</p>
                </div>
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Do you want to send an access request to the developer of this project?</p>
                <div class="flex justify-end gap-3">
                  <button (click)="requestStep.set(1)" class="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Back</button>
                  <button (click)="sendRequest()" [disabled]="requesting()" class="px-4 py-2 bg-indigo-600 dark:bg-purple-600 text-white font-medium rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    @if (requesting()) { <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon> } Confirm Request
                  </button>
                </div>
              } @else if (requestStep() === 3) {
                <div class="text-center py-6">
                  <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <mat-icon class="text-3xl">check</mat-icon>
                  </div>
                  <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Request Sent!</h3>
                  <p class="text-zinc-600 dark:text-zinc-400 mb-6">The developer will review your request.</p>
                  <button (click)="closeRequestModal()" class="px-6 py-2 bg-zinc-900 dark:bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">Close</button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (showNotifModal()) {
        <div class="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-300">
            <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Notifications</h3>
              <button (click)="closeNotifModal()" class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1">
              @if (userNotifications().length === 0) {
                <div class="text-center py-8">
                  <mat-icon class="text-zinc-300 dark:text-zinc-600 text-5xl mb-3">notifications_none</mat-icon>
                  <p class="text-zinc-500 dark:text-zinc-400 font-medium">No new notifications</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (notif of userNotifications(); track notif.id) {
                    <div class="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700" [class.bg-emerald-50]="notif.type === 'access_granted'" [class.dark:bg-emerald-900/20]="notif.type === 'access_granted'" [class.bg-red-50]="notif.type === 'access_declined'" [class.dark:bg-red-900/20]="notif.type === 'access_declined'">
                      <div class="flex items-start gap-3">
                        <mat-icon [class.text-emerald-600]="notif.type === 'access_granted'" [class.dark:text-emerald-400]="notif.type === 'access_granted'" [class.text-red-600]="notif.type === 'access_declined'" [class.dark:text-red-400]="notif.type === 'access_declined'">
                          {{ notif.type === 'access_granted' ? 'check_circle' : 'cancel' }}
                        </mat-icon>
                        <div>
                          <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {{ notif.type === 'access_granted' ? 'Access Granted' : 'Access Declined' }}
                          </p>
                          <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Your request to access <strong>{{ notif.projectName }}</strong> has been {{ notif.type === 'access_granted' ? 'approved' : 'declined' }}.
                          </p>
                          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-2">{{ notif.createdAt | date:'short' }}</p>
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
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  user = signal<any>(null);
  apps = signal<any[]>([]);

  // Notifications
  showNotifModal = signal(false);
  userNotifications = signal<any[]>([]);
  unreadCount = signal(0);

  // Request Connection
  showRequestModal = signal(false);
  requestStep = signal(1);
  requestProjectIdControl = this.fb.control('', Validators.required);
  requestError = signal('');
  requesting = signal(false);
  requestProjectName = signal('');
  requestProjectId = signal('');

  // Edit Profile
  showEditProfile = signal(false);
  savingProfile = signal(false);
  editPhotoBase64 = signal<string | null>(null);
  editProfileForm = this.fb.group({
    name: ['', Validators.required],
    gender: ['', Validators.required],
    dob: ['', Validators.required]
  });

  // Retrain Voice
  showRetrainVoice = signal(false);
  savingVoice = signal(false);
  voiceSamples = signal<string[]>(['', '', '']);
  recordingIndex = signal<number | null>(null);
  recordingTimeLeft = signal(7);
  recordingError = signal('');
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerInterval: any;

  sentences = [
    "My voice is my password, and it verifies my identity.",
    "My spoken words verify my identity, acting as a secure password.",
    "The voice recognition system verifies my voice to help me log in."
  ];

  allVoicesRecorded() {
    return this.voiceSamples().every(sample => sample !== '');
  }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    this.user.set(JSON.parse(userStr));
    
    // Fetch connected apps
    this.http.get<any[]>('/api/user/apps', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => this.apps.set(res),
      error: (err) => console.error('Failed to fetch apps', err)
    });

    this.fetchNotifications();
  }

  fetchNotifications() {
    this.http.get<any[]>('/api/notifications/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (res) => {
        this.userNotifications.set(res);
        this.unreadCount.set(res.length); // Assuming all are unread for now, or could filter by a read status
      },
      error: (err) => console.error('Failed to fetch notifications', err)
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  copyId() {
    const id = this.user()?.id;
    if (id) {
      navigator.clipboard.writeText(id);
    }
  }

  // --- Edit Profile Methods ---
  openEditProfile() {
    const u = this.user();
    if (u) {
      this.editProfileForm.patchValue({
        name: u.name || '',
        gender: u.gender || '',
        dob: u.dob || ''
      });
      this.editPhotoBase64.set(null);
      this.showEditProfile.set(true);
    }
  }

  closeEditProfile() {
    this.showEditProfile.set(false);
  }

  onEditPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editPhotoBase64.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (this.editProfileForm.invalid) return;
    this.savingProfile.set(true);
    
    const payload = {
      userId: this.user()?.id,
      ...this.editProfileForm.value,
      photo: this.editPhotoBase64() || this.user()?.photo
    };

    this.http.put<any>('/api/user/profile', payload).subscribe({
      next: (res) => {
        this.user.set(res);
        localStorage.setItem('user', JSON.stringify(res));
        this.savingProfile.set(false);
        this.closeEditProfile();
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.savingProfile.set(false);
      }
    });
  }

  // --- Retrain Voice Methods ---
  openRetrainVoice() {
    this.voiceSamples.set(['', '', '']);
    this.recordingIndex.set(null);
    this.recordingError.set('');
    this.showRetrainVoice.set(true);
  }

  closeRetrainVoice() {
    this.stopRecording();
    this.showRetrainVoice.set(false);
  }

  async toggleRecording(index: number) {
    if (this.recordingIndex() === index) {
      this.stopRecording();
    } else {
      await this.startRecording(index);
    }
  }

  async startRecording(index: number) {
    try {
      this.recordingError.set('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          this.voiceSamples.update(samples => {
            const newSamples = [...samples];
            newSamples[index] = base64data;
            return newSamples;
          });
        };
      };

      this.mediaRecorder.start();
      this.recordingIndex.set(index);
      this.recordingTimeLeft.set(7);
      
      this.timerInterval = setInterval(() => {
        this.recordingTimeLeft.update(v => v - 1);
        if (this.recordingTimeLeft() <= 0) {
          this.stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.recordingError.set('Microphone access denied or not available.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.recordingIndex.set(null);
      clearInterval(this.timerInterval);
    }
  }

  saveVoiceModel() {
    if (!this.allVoicesRecorded()) return;
    this.savingVoice.set(true);
    
    this.http.put<any>('/api/user/voice', {
      userId: this.user()?.id,
      voiceSamples: this.voiceSamples()
    }).subscribe({
      next: () => {
        this.savingVoice.set(false);
        this.closeRetrainVoice();
        alert('Voice model updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update voice', err);
        this.recordingError.set('Failed to update voice model.');
        this.savingVoice.set(false);
      }
    });
  }

  // --- Notifications Methods ---
  closeNotifModal() {
    this.showNotifModal.set(false);
    this.unreadCount.set(0); // Mark as read when closed
  }

  // --- Request Connection Methods ---
  openRequestModal() {
    this.requestStep.set(1);
    this.requestProjectIdControl.reset();
    this.requestError.set('');
    this.requestProjectName.set('');
    this.requestProjectId.set('');
    this.showRequestModal.set(true);
  }

  closeRequestModal() {
    this.showRequestModal.set(false);
  }

  checkProject() {
    if (this.requestProjectIdControl.invalid) return;
    this.requesting.set(true);
    this.requestError.set('');
    const projectId = this.requestProjectIdControl.value;
    
    if (!projectId) {
      this.requesting.set(false);
      return;
    }

    this.http.get<any>(`/api/projects/${projectId}/check`).subscribe({
      next: (res) => {
        this.requesting.set(false);
        if (res.exists) {
          this.requestProjectName.set(res.name);
          this.requestProjectId.set(projectId);
          this.requestStep.set(2);
        } else {
          this.requestError.set('Project not found. Please check the ID.');
        }
      },
      error: (err) => {
        console.error('Failed to check project', err);
        this.requesting.set(false);
        this.requestError.set('Error checking project. Please try again.');
      }
    });
  }

  sendRequest() {
    this.requesting.set(true);
    this.http.post<any>('/api/notifications/request', {
      projectId: this.requestProjectId()
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: () => {
        this.requesting.set(false);
        this.requestStep.set(3);
      },
      error: (err) => {
        console.error('Failed to send request', err);
        this.requesting.set(false);
        this.requestError.set(err.error?.error || 'Failed to send request.');
        this.requestStep.set(1); // Go back to show error
      }
    });
  }
}
