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
                        [class.bg-amber-500/20]="detectResult()?.status === 'access_denied'"
                        [class.text-amber-400]="detectResult()?.status === 'access_denied'"
                        [class.bg-red-500/20]="detectResult()?.status === 'not_recognised' || detectResult()?.status === 'error'"
                        [class.text-red-400]="detectResult()?.status === 'not_recognised' || detectResult()?.status === 'error'">
                    {{ detectResult()?.status === 'success' ? '✓ Recognised' : detectResult()?.status === 'access_denied' ? '⚠ Access Denied' : '✗ Not Recognised' }}
                  </span>
                }
              </div>
              
              <div class="flex-1 flex flex-col gap-4 overflow-auto">
                @if (processing()) {
                  <div class="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <mat-icon class="animate-spin text-indigo-500 dark:text-purple-500 text-4xl mb-4">autorenew</mat-icon>
                    <p>Awaiting API response...</p>
                  </div>
                } @else if (detectResult()) {

                  <!-- User card on success -->
                  @if (detectResult()?.status === 'success' && detectResult()?.data) {
                    <div class="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                      @if (detectResult()?.data?.image) {
                        <img [src]="detectResult()?.data?.image" class="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 flex-shrink-0" />
                      } @else {
                        <div class="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                          <mat-icon class="text-zinc-400 text-2xl">person</mat-icon>
                        </div>
                      }
                      <div class="text-sm space-y-0.5">
                        <p class="font-bold text-white text-base">{{ detectResult()?.data?.name }}</p>
                        <p class="text-zinc-400">{{ detectResult()?.data?.email }}</p>
                        <p class="text-zinc-400">ID: {{ detectResult()?.data?.uniqueId }}</p>
                        <p class="text-emerald-400 font-medium">Confidence: {{ detectResult()?.data?.confidence }}</p>
                      </div>
                    </div>
                  }

                  <!-- Raw JSON -->
                  <div class="flex-1 bg-black/50 rounded-xl border border-zinc-800 p-4 overflow-auto font-mono text-sm">
                    <pre class="text-emerald-400 whitespace-pre-wrap">{{ detectResult() | json }}</pre>
                  </div>

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
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        console.log('[VOICE] captured', audioBlob.size, 'bytes', audioBlob.type);
        stream.getTracks().forEach(track => track.stop());
        try {
          const rawBase64 = await this.blobToWavBase64(audioBlob);
          this.processVoiceSample(rawBase64);
        } catch (err) {
          console.error('Audio capture failed:', err);
          this.detectResult.set({ status: 'error', message: 'Audio capture failed. Please try again.', data: null });
          this.processing.set(false);
        }
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

  processVoiceSample(base64Audio: string) {
    this.processing.set(true);
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
  }

  logout() {
    localStorage.removeItem('testToken');
    localStorage.removeItem('testUser');
    this.router.navigate(['/']);
  }

  private async blobToWavBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return buffer;
  }
}
