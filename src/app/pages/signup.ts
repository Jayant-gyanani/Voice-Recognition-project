import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans py-12 relative">
      <a routerLink="/" class="absolute top-6 left-6 p-2 rounded-full bg-white shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-colors flex items-center justify-center text-zinc-600">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 w-full max-w-xl">
        <div class="flex items-center justify-center gap-2 mb-8">
          <mat-icon class="text-indigo-600">record_voice_over</mat-icon>
          <span class="text-xl font-bold tracking-tight">VoiceAuth</span>
        </div>
        
        <h2 class="text-2xl font-bold text-center mb-6 text-zinc-900">Create your account</h2>
        
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
              <input id="name" type="text" formControlName="name" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input id="email" type="email" formControlName="email" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="password" class="block text-sm font-medium text-zinc-700 mb-1">Password</label>
              <input id="password" type="password" formControlName="password" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
            </div>
            <div>
              <label for="gender" class="block text-sm font-medium text-zinc-700 mb-1">Gender</label>
              <select id="gender" formControlName="gender" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label for="dob" class="block text-sm font-medium text-zinc-700 mb-1">Date of Birth</label>
            <input id="dob" type="date" formControlName="dob" class="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
          </div>
          
          <div>
            <label for="photo" class="block text-sm font-medium text-zinc-700 mb-1">Profile Photo</label>
            <div class="flex items-center gap-4">
              @if (photoBase64()) {
                <img [src]="photoBase64()" alt="Profile Photo" class="w-16 h-16 rounded-full object-cover border border-zinc-300">
              } @else {
                <div class="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center">
                  <mat-icon class="text-zinc-400">person</mat-icon>
                </div>
              }
              <input id="photo" type="file" accept="image/*" (change)="onPhotoSelected($event)" class="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
            </div>
          </div>
          
          <div class="border border-zinc-200 rounded-xl p-6 bg-zinc-50">
            <h3 class="text-sm font-medium text-zinc-900 mb-4 flex items-center gap-2">
              <mat-icon class="text-indigo-600">mic</mat-icon> Voice Registration (3 Samples Required)
            </h3>
            
            <div class="space-y-4">
              @for (sentence of sentences; track $index) {
                <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                  <p class="text-sm text-zinc-700 font-medium italic mb-4">"{{ sentence }}"</p>
                  
                  <div class="flex items-center gap-4">
                    <button type="button" 
                      (click)="toggleRecording($index)" 
                      [disabled]="recordingIndex() !== null && recordingIndex() !== $index"
                      [class.bg-red-500]="recordingIndex() === $index" 
                      [class.text-white]="recordingIndex() === $index" 
                      [class.bg-zinc-100]="recordingIndex() !== $index" 
                      [class.text-zinc-900]="recordingIndex() !== $index" 
                      class="border border-zinc-300 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors disabled:opacity-50">
                      <mat-icon>{{ recordingIndex() === $index ? 'stop' : 'mic' }}</mat-icon>
                      {{ recordingIndex() === $index ? 'Recording (' + recordingTimeLeft() + 's)' : (voiceSamples()[$index] ? 'Re-record' : 'Record') }}
                    </button>
                    
                    @if (voiceSamples()[$index] && recordingIndex() !== $index) {
                      <div class="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <mat-icon class="text-sm">check_circle</mat-icon> Recorded
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            
            @if (recordingError()) {
              <p class="text-xs text-red-500 mt-4">{{ recordingError() }}</p>
            }
          </div>
          
          @if (error()) {
            <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{{ error() }}</div>
          }
          
          <button type="submit" [disabled]="signupForm.invalid || loading() || !allVoicesRecorded()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
            @if (loading()) {
              <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon>
            } @else {
              Create Account
            }
          </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-zinc-600">
          Already have an account? <a routerLink="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">Log in</a>
        </p>
      </div>
    </div>
  `
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    gender: ['', Validators.required],
    dob: ['', Validators.required]
  });

  loading = signal(false);
  error = signal('');
  
  sentences = [
    "My voice is my password, and it verifies my identity.",
    "My spoken words verify my identity, acting as a secure password.",
    "The voice recognition system verifies my voice to help me log in."
  ];

  voiceSamples = signal<string[]>(['', '', '']);
  recordingIndex = signal<number | null>(null);
  recordingTimeLeft = signal(7);
  recordingError = signal('');
  
  photoBase64 = signal<string | null>(null);
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerInterval: any;

  allVoicesRecorded() {
    return this.voiceSamples().every(sample => sample !== '');
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoBase64.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
        
        // Convert to base64
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

  onSubmit() {
    if (this.signupForm.invalid || !this.allVoicesRecorded()) return;
    
    this.loading.set(true);
    this.error.set('');
    
    const payload = {
      ...this.signupForm.value,
      voiceSamples: this.voiceSamples(),
      photo: this.photoBase64()
    };
    
    this.http.post<any>('/api/auth/signup', payload).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Signup failed');
      }
    });
  }
}
