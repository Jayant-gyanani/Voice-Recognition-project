import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeToggleComponent } from '../components/theme-toggle';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatIconModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-sky-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">

      <!-- Header -->
      <header class="flex items-center justify-between px-8 py-5 border-b border-sky-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
  
  <div class="flex-1 flex justify-start">
    <img src="/logo.png" alt="Lords logo" class="h-12 w-32 ">
  </div>

  <div class="flex items-center gap-2">
    <mat-icon class="text-sky-600 dark:text-purple-500">record_voice_over</mat-icon>
    <div class="flex flex-col leading-tight">
      <div class="flex items-center gap-1">
        <span class="text-xl font-bold tracking-tight text-sky-700 dark:text-zinc-100">VoiceAuth</span>
        <mat-icon class="text-sky-500" style="font-size: 10px; width: 10px; height: 10px;">trademark</mat-icon>
      </div>
      <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Group J2K</span>
    </div>
  </div>

  <nav class="flex-1 flex items-center justify-end gap-6">
    <app-theme-toggle></app-theme-toggle>
    <div class="flex items-center gap-4">
      <a routerLink="/login" class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Login</a>
      <a routerLink="/signup" class="text-sm font-medium bg-sky-600 text-white px-4 py-2 rounded-xl shadow-sm">Sign Up</a>
    </div>
  </nav>

</header>

      <main>

        <!-- ── Hero Section ── -->
        <section class="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-16">

          <!-- Left: text -->
          <div class="flex-1 text-left">
            <span class="inline-block text-xs font-bold tracking-widest text-sky-600 dark:text-purple-400 uppercase bg-sky-100 dark:bg-purple-900/30 px-3 py-1 rounded-full mb-6">
              Voice Recognition as a Service
            </span>
            <h1 class="text-5xl font-extrabold tracking-tight mb-6 leading-tight text-zinc-900 dark:text-zinc-100">
              Your Voice is<br>
              <span class="text-sky-600 dark:text-purple-400">Your Password.</span>
            </h1>
            <p class="text-lg text-zinc-600 dark:text-zinc-400 mb-4 max-w-lg">
              VoiceAuth is a centralised biometric authentication platform. Register your voice once — then use it to log in to any app that integrates VoiceAuth.
            </p>
            <p class="text-base text-zinc-500 dark:text-zinc-500 mb-10 max-w-lg">
              No more passwords to remember. No SMS codes to wait for. Just speak naturally and get verified in seconds.
            </p>
            <div class="flex items-center gap-4 flex-wrap">
              <a routerLink="/signup" class="bg-sky-600 dark:bg-purple-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-sky-700 dark:hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md">
                Create Free Account <mat-icon>arrow_forward</mat-icon>
              </a>
              <a routerLink="/developer" class="bg-white dark:bg-zinc-800 border border-sky-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 px-7 py-3.5 rounded-xl font-semibold hover:bg-sky-50 dark:hover:bg-zinc-700 transition-colors shadow-sm flex items-center gap-2">
                <mat-icon class="text-sky-600 dark:text-purple-400">code</mat-icon> Developer Portal
              </a>
            </div>
          </div>

          <!-- Right: illustration -->
          <div class="flex-1 flex items-center justify-center">
            <div class="relative w-full max-w-sm">
              <!-- Glow blob -->
              <div class="absolute inset-0 bg-sky-400/20 dark:bg-purple-600/20 rounded-full blur-3xl scale-110"></div>

              <!-- Central card -->
              <div class="relative bg-white dark:bg-zinc-900 rounded-3xl border border-sky-100 dark:border-zinc-700 shadow-xl p-10 text-center">
                <!-- Animated mic icon -->
                <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-sky-100 dark:bg-purple-900/40 flex items-center justify-center relative">
                  <div class="absolute inset-0 rounded-full bg-sky-200 dark:bg-purple-700/40 animate-ping opacity-30"></div>
                  <mat-icon style="font-size:48px;width:48px;height:48px" class="text-sky-600 dark:text-purple-400">mic</mat-icon>
                </div>
                <p class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Listening…</p>
                <!-- Fake waveform bars -->
                <div class="flex items-end justify-center gap-1 h-10 mb-4">
                  <div class="w-1.5 rounded-full bg-sky-300 dark:bg-purple-600" style="height:30%;animation:bar 1s ease-in-out infinite alternate;animation-delay:0s"></div>
                  <div class="w-1.5 rounded-full bg-sky-400 dark:bg-purple-500" style="height:70%;animation:bar 1s ease-in-out infinite alternate;animation-delay:.15s"></div>
                  <div class="w-1.5 rounded-full bg-sky-500 dark:bg-purple-400" style="height:90%;animation:bar 1s ease-in-out infinite alternate;animation-delay:.3s"></div>
                  <div class="w-1.5 rounded-full bg-sky-600 dark:bg-purple-300" style="height:55%;animation:bar 1s ease-in-out infinite alternate;animation-delay:.45s"></div>
                  <div class="w-1.5 rounded-full bg-sky-500 dark:bg-purple-400" style="height:80%;animation:bar 1s ease-in-out infinite alternate;animation-delay:.6s"></div>
                  <div class="w-1.5 rounded-full bg-sky-400 dark:bg-purple-500" style="height:40%;animation:bar 1s ease-in-out infinite alternate;animation-delay:.75s"></div>
                  <div class="w-1.5 rounded-full bg-sky-300 dark:bg-purple-600" style="height:60%;animation:bar 1s ease-in-out infinite alternate;animation-delay:.9s"></div>
                </div>
                <div class="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <mat-icon class="text-sm">check_circle</mat-icon> Identity Verified
                </div>
              </div>

              <!-- Floating badges -->
              <div class="absolute -top-4 -left-4 bg-white dark:bg-zinc-800 rounded-xl shadow-md px-3 py-2 flex items-center gap-2 border border-sky-100 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <mat-icon class="text-sky-500 dark:text-purple-400" style="font-size:16px">security</mat-icon> Biometric Auth
              </div>
              <div class="absolute -bottom-4 -right-4 bg-white dark:bg-zinc-800 rounded-xl shadow-md px-3 py-2 flex items-center gap-2 border border-sky-100 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <mat-icon class="text-emerald-500" style="font-size:16px">bolt</mat-icon> &lt; 2s Verification
              </div>
            </div>
          </div>
        </section>

        <!-- ── How it works ── -->
        <section class="bg-white dark:bg-zinc-900 border-y border-sky-100 dark:border-zinc-800 py-16 transition-colors duration-300">
          <div class="max-w-5xl mx-auto px-8 text-center">
            <h2 class="text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">How It Works</h2>
            <p class="text-zinc-500 dark:text-zinc-400 mb-12">Three simple steps — for both users and developers.</p>
            <div class="grid md:grid-cols-3 gap-8 text-left">
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-sky-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-purple-400 font-bold text-lg flex-shrink-0">1</div>
                <div>
                  <h4 class="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Sign Up &amp; Record</h4>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">Create an account and record 3 short voice samples. Our AI builds your unique voice profile.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-sky-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-purple-400 font-bold text-lg flex-shrink-0">2</div>
                <div>
                  <h4 class="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Developer Integrates</h4>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">Developers add a single API call to their site. A popup handles everything — no voice code required.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-sky-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-purple-400 font-bold text-lg flex-shrink-0">3</div>
                <div>
                  <h4 class="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Speak &amp; Get In</h4>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">The visitor speaks one sentence. VoiceAuth identifies them and returns their profile to the developer's app.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Feature cards ── -->
        <section class="max-w-5xl mx-auto px-8 py-16">
          <h2 class="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-zinc-100">Why VoiceAuth?</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-sky-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-purple-500/50 transition-all duration-300">
              <div class="w-12 h-12 bg-sky-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-5">
                <mat-icon class="text-sky-600 dark:text-purple-400">mic</mat-icon>
              </div>
              <h3 class="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">Register Once</h3>
              <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Register your voice profile on VoiceAuth once. It works across every application that integrates our service — no re-registration needed.</p>
            </div>
            <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-sky-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-purple-500/50 transition-all duration-300">
              <div class="w-12 h-12 bg-sky-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-5">
                <mat-icon class="text-sky-600 dark:text-purple-400">api</mat-icon>
              </div>
              <h3 class="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">Easy Integration</h3>
              <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">One API key. One POST request. A popup handles all recording and recognition. Developers get a full user profile in the response.</p>
            </div>
            <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-sky-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-purple-500/50 transition-all duration-300">
              <div class="w-12 h-12 bg-sky-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-5">
                <mat-icon class="text-sky-600 dark:text-purple-400">verified_user</mat-icon>
              </div>
              <h3 class="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">Biometric Security</h3>
              <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Powered by deep learning voice embeddings. Each voice is unique — cannot be copied, stolen, or guessed like a password.</p>
            </div>
          </div>
        </section>

        <!-- ── CTA Banner ── -->
        <section class="max-w-5xl mx-auto px-8 pb-20">
          <div class="bg-sky-600 dark:bg-purple-700 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-xl">
            <div class="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <mat-icon style="font-size:240px;width:240px;height:240px">record_voice_over</mat-icon>
            </div>
            <div class="relative z-10">
              <h2 class="text-3xl font-bold mb-3">Ready to go passwordless?</h2>
              <p class="text-sky-100 dark:text-purple-100 mb-8 text-lg">Join VoiceAuth today — it takes less than 2 minutes to register your voice.</p>
              <a routerLink="/signup" class="inline-flex items-center gap-2 bg-white text-sky-700 dark:text-purple-700 px-8 py-4 rounded-xl font-bold hover:bg-sky-50 transition-colors text-lg shadow-md">
                Get Started Free <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        </section>

      </main>

      <!-- Footer -->
      <footer class="border-t border-sky-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500 transition-colors duration-300">
        <div class="flex items-center justify-center gap-2 mb-0">
          <mat-icon class="text-sky-500 dark:text-purple-500" style="font-size:22px">record_voice_over</mat-icon>
          <span class="font-bold  text-zinc-600 dark:text-zinc-300" style="font-size:22px">VoiceAuth</span>
          </div>
          
          <div class="w-full flex justify-center items-center py-6 px-4">
          <div class="flex flex-col items-center text-center gap-1.5">    
          <p class="text-xs italic text-slate-600 dark:text-slate-400 max-w-sm" style="font-size:13px">
          <b>TM</b> Developed by Jayant Gyanani, Kanika Sharma, & Komal Kumari
    </p>
    </div>
    </div>

      </footer>
    </div>

    <style>
      @keyframes bar {
        from { transform: scaleY(0.4); }
        to   { transform: scaleY(1);   }
      }
    </style>
  `
})
export class LandingComponent {}
