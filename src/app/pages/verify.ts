import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans relative transition-colors duration-300">
      <button (click)="closeWindow()" class="absolute top-6 left-6 p-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center text-zinc-600 dark:text-zinc-400 z-50">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-md relative overflow-hidden transition-colors duration-300">
        <!-- Background glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-center gap-2 mb-8">
            <mat-icon class="text-indigo-600 dark:text-purple-500">record_voice_over</mat-icon>
            <span class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">VoiceAuth Verification</span>
          </div>
          
          @if (sessionError()) {
            <div class="text-center">
              <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-red-500 dark:text-red-400 text-3xl">error_outline</mat-icon>
              </div>
              <h2 class="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Invalid Session</h2>
              <p class="text-zinc-600 dark:text-zinc-400 mb-6">{{ sessionError() }}</p>
              <button (click)="closeWindow()" class="bg-zinc-900 dark:bg-zinc-800 text-white px-6 py-2 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                Close Window
              </button>
            </div>
          } @else if (verificationResult()) {
            <div class="text-center">
              @if (verificationResult()?.success) {
                <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <mat-icon class="text-emerald-500 dark:text-emerald-400 text-4xl">check_circle</mat-icon>
                </div>
                <h2 class="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Successful</h2>
                <p class="text-zinc-600 dark:text-zinc-400 mb-6">Closing automatically in 3 seconds...</p>
              } @else {
                <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <mat-icon class="text-red-500 dark:text-red-400 text-4xl">cancel</mat-icon>
                </div>
                <h2 class="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">User not recognised</h2>
                <p class="text-zinc-600 dark:text-zinc-400 mb-6">Closing automatically in 3 seconds...</p>
              }
            </div>
          } @else {
            <div class="text-center">
              <h2 class="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Verify your identity</h2>
              <p class="text-zinc-600 dark:text-zinc-400 mb-8">Please read the following phrase clearly:</p>
              
              <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 mb-8 transition-colors duration-300">
                <p class="text-lg font-medium text-indigo-600 dark:text-purple-400 italic">"{{ selectedSentence() }}"</p>
              </div>
              
              <div class="flex flex-col items-center justify-center gap-6">
                <button 
                  (click)="toggleRecording()" 
                  [class.bg-red-500]="isRecording()" 
                  [class.hover:bg-red-600]="isRecording()" 
                  [class.bg-indigo-600]="!isRecording() && !audioBase64()" 
                  [class.hover:bg-indigo-700]="!isRecording() && !audioBase64()" 
                  [class.dark:bg-purple-600]="!isRecording() && !audioBase64()" 
                  [class.dark:hover:bg-purple-700]="!isRecording() && !audioBase64()" 
                  [class.bg-zinc-200]="!isRecording() && audioBase64()"
                  [class.dark:bg-zinc-800]="!isRecording() && audioBase64()"
                  [class.text-zinc-600]="!isRecording() && audioBase64()"
                  [class.dark:text-zinc-400]="!isRecording() && audioBase64()"
                  [class.text-white]="isRecording() || (!isRecording() && !audioBase64())"
                  class="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group relative">
                  
                  @if (isRecording()) {
                    <span class="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></span>
                  }
                  
                  <mat-icon class="text-4xl group-hover:scale-110 transition-transform">
                    {{ isRecording() ? 'stop' : (audioBase64() ? 'replay' : 'mic') }}
                  </mat-icon>
                </button>
                
                <p class="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  {{ isRecording() ? 'Recording... ' + recordingTimeLeft() + 's left' : (audioBase64() ? 'Tap to re-record' : 'Tap to start recording') }}
                </p>
                
                @if (audioBase64() && !isRecording()) {
                  <button (click)="submitVoice()" [disabled]="verifying()" class="w-full bg-indigo-600 dark:bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-4">
                    @if (verifying()) {
                      <mat-icon class="animate-spin h-5 w-5">autorenew</mat-icon> Analyzing Voice...
                    } @else {
                      Verify Voice <mat-icon>arrow_forward</mat-icon>
                    }
                  </button>
                }
                
                @if (recordingError()) {
                  <p class="text-sm text-red-600 dark:text-red-400 mt-2">{{ recordingError() }}</p>
                }
              </div>
              
              <div class="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  Session expires in {{ timeLeft() }}s
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class VerifyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  sessionId = signal<string | null>(null);
  sessionError = signal('');
  
  isRecording = signal(false);
  audioBase64 = signal<string | null>(null);
  recordingError = signal('');
  recordingTimeLeft = signal(7);
  
  verifying = signal(false);
  verificationResult = signal<any>(null);
  
  sentences = [
    "My voice is my password, and it verifies my identity.",
    "My spoken words verify my identity, acting as a secure password.",
    "The voice recognition system verifies my voice to help me log in."
  ];
  selectedSentence = signal('');
  
  timeLeft = signal(180); // 3 minutes
  private timer: any;
  private recordingTimer: any;
  private closeTimeout: any;
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  ngOnInit() {
    this.selectedSentence.set(this.sentences[Math.floor(Math.random() * this.sentences.length)]);
    this.sessionId.set(this.route.snapshot.paramMap.get('sessionId'));
    
    if (!this.sessionId()) {
      this.sessionError.set('No session ID provided.');
      return;
    }
    
    // Validate session
    this.http.get<any>(`/api/verify/session/${this.sessionId()}`).subscribe({
      next: () => {
        this.startTimer();
      },
      error: (err) => {
        this.sessionError.set(err.error?.message || 'Invalid or expired session.');
      }
    });
  }
  
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.stopRecording();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        clearInterval(this.timer);
        this.sessionError.set('Session expired.');
      }
    }, 1000);
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
      this.recordingError.set('');
      this.audioBase64.set(null);
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
          this.audioBase64.set(base64data);
        };
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingTimeLeft.set(7);
      
      this.recordingTimer = setInterval(() => {
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
      this.isRecording.set(false);
      clearInterval(this.recordingTimer);
    }
  }

  submitVoice() {
    if (!this.audioBase64() || !this.sessionId()) return;
    
    this.verifying.set(true);
    
    this.http.post<any>('/api/verify/analyze', {
      sessionId: this.sessionId(),
      voiceSample: this.audioBase64()
    }).subscribe({
      next: (res) => {
        this.verifying.set(false);
        this.verificationResult.set(res);
        
        if (res.success) {
          // Auto close after 3 seconds on success
          this.closeTimeout = setTimeout(() => {
            this.closeWindow();
          }, 3000);
        }
      },
      error: (err) => {
        this.verifying.set(false);
        this.verificationResult.set({
          success: false,
          message: err.error?.message || 'User not recognised'
        });
        
        // Auto close after 3 seconds on failure to return result to developer
        this.closeTimeout = setTimeout(() => {
          this.closeWindow();
        }, 3000);
      }
    });
  }
  
  resetVerification() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    this.verificationResult.set(null);
    this.audioBase64.set(null);
    this.recordingError.set('');
    this.selectedSentence.set(this.sentences[Math.floor(Math.random() * this.sentences.length)]);
  }

  closeWindow() {
    // In a real scenario, this would postMessage to the parent window
    // and then close itself.
    if (window.opener) {
      window.opener.postMessage({ type: 'VOICE_AUTH_RESULT', result: this.verificationResult() }, '*');
      window.close();
    } else {
      // Fallback if not opened in a popup
      window.history.back();
    }
  }
}
