import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { JsonPipe } from '@angular/common';
import { ThemeToggleComponent } from '../components/theme-toggle';

@Component({
  selector: 'app-test-dashboard',
  standalone: true,
  imports: [MatIconModule, JsonPipe, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col transition-colors duration-300">
      <header class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <div class="flex items-center gap-2">
          <mat-icon class="text-indigo-600 dark:text-purple-400">science</mat-icon>
          <span class="text-xl font-bold tracking-tight">Test Environment</span>
        </div>
        <nav class="flex items-center gap-6">
          <app-theme-toggle></app-theme-toggle>
          <button (click)="logout()" class="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors ml-4">
            <mat-icon class="text-sm">logout</mat-icon> Logout
          </button>
        </nav>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-8 py-12 flex flex-col">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Voice Authentication Test</h1>
          <p class="text-zinc-500 dark:text-zinc-400">Simulate the user experience of voice authentication and view the API response.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 flex-1">
          <!-- Left Side: Voice Submission -->
          <div class="flex flex-col h-full">
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 flex-1 flex flex-col transition-colors duration-300">
              <div class="text-center mb-8">
                <div class="w-16 h-16 bg-indigo-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <mat-icon class="text-indigo-600 dark:text-purple-400 text-3xl">record_voice_over</mat-icon>
                </div>
                <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Voice Authentication</h2>
                <p class="text-zinc-600 dark:text-zinc-400">Please read the phrase below clearly to verify your identity.</p>
              </div>

              <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 text-center mb-8 flex-1 flex flex-col justify-center transition-colors duration-300">
                <p class="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold mb-4">Verification Phrase</p>
                <p class="text-xl font-medium text-zinc-900 dark:text-zinc-100 italic mb-8">"My voice is my password, and it verifies my identity."</p>
                
                <div class="relative w-32 h-32 mx-auto mb-6">
                  @if (isRecording()) {
                    <div class="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
                    <div class="absolute inset-2 bg-red-200 dark:bg-red-800/40 rounded-full animate-pulse"></div>
                  }
                  <button 
                    (click)="toggleRecording()" 
                    [disabled]="processing()"
                    [class.bg-red-500]="isRecording()"
                    [class.hover:bg-red-600]="isRecording()"
                    [class.bg-indigo-600]="!isRecording()"
                    [class.hover:bg-indigo-700]="!isRecording()"
                    [class.dark:bg-purple-600]="!isRecording()"
                    [class.dark:hover:bg-purple-700]="!isRecording()"
                    class="relative z-10 w-full h-full rounded-full text-white shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <mat-icon class="text-5xl">{{ isRecording() ? 'stop' : 'mic' }}</mat-icon>
                  </button>
                </div>
                
                <p class="text-sm font-medium" [class.text-red-500]="isRecording()" [class.dark:text-red-400]="isRecording()" [class.text-zinc-500]="!isRecording()" [class.dark:text-zinc-400]="!isRecording()">
                  @if (processing()) {
                    Processing audio...
                  } @else if (isRecording()) {
                    Recording... {{ recordingTimeLeft() }}s left
                  } @else {
                    Click the microphone to start
                  }
                </p>
              </div>
            </div>
          </div>

          <!-- Right Side: API Response -->
          <div class="flex flex-col h-full">
            <div class="bg-zinc-900 dark:bg-zinc-950 rounded-2xl border border-zinc-800 dark:border-zinc-700 shadow-sm p-6 flex-1 flex flex-col text-white transition-colors duration-300">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold flex items-center gap-2">
                  <mat-icon class="text-emerald-400">data_object</mat-icon> API Response
                </h2>
                @if (detectResult()) {
                  <span class="px-2 py-1 text-xs font-bold rounded-md"
                        [class.bg-emerald-500/20]="detectResult()?.status === 'success'"
                        [class.text-emerald-400]="detectResult()?.status === 'success'"
                        [class.bg-red-500/20]="detectResult()?.status !== 'success'"
                        [class.text-red-400]="detectResult()?.status !== 'success'">
                    {{ detectResult()?.status === 'success' ? '200 OK' : '403 Forbidden' }}
                  </span>
                }
              </div>
              
              <div class="flex-1 bg-black/50 dark:bg-black/80 rounded-xl border border-zinc-800 dark:border-zinc-700 p-4 overflow-auto font-mono text-sm">
                @if (processing()) {
                  <div class="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <mat-icon class="animate-spin text-indigo-500 dark:text-purple-500 text-4xl mb-4">autorenew</mat-icon>
                    <p>Awaiting API response...</p>
                  </div>
                } @else if (detectResult()) {
                  <pre class="text-emerald-400 whitespace-pre-wrap">{{ detectResult() | json }}</pre>
                } @else {
                  <div class="h-full flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500">
                    <mat-icon class="text-4xl mb-2 opacity-50">code</mat-icon>
                    <p>Submit a voice sample to view the returned payload</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class TestDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);

  isRecording = signal(false);
  processing = signal(false);
  detectResult = signal<any>(null);
  recordingTimeLeft = signal(7);
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerInterval: any;

  ngOnInit() {
    const token = localStorage.getItem('testToken');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    if (this.isRecording() && this.mediaRecorder) {
      this.mediaRecorder.stop();
      clearInterval(this.timerInterval);
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
      
      this.http.post<any>('/api/test/voice-detect', {
        voiceSample: base64Audio
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('testToken')}` }
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
    localStorage.removeItem('testToken');
    localStorage.removeItem('testUser');
    this.router.navigate(['/']);
  }
}
