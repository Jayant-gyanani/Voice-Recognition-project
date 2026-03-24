import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <header class="flex items-center justify-between px-8 py-6 border-b border-zinc-200 bg-white">
        <div class="flex items-center gap-2">
          <mat-icon class="text-indigo-600">record_voice_over</mat-icon>
          <span class="text-xl font-bold tracking-tight">VoiceAuth</span>
        </div>
        <nav class="flex items-center gap-4">
          <a routerLink="/login" class="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Login</a>
          <a routerLink="/signup" class="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors">Sign Up</a>
        </nav>
      </header>

      <main class="max-w-5xl mx-auto px-8 py-24">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h1 class="text-5xl font-bold tracking-tight mb-6 text-zinc-900">
            The Centralized Voice Recognition Platform
          </h1>
          <p class="text-lg text-zinc-600 mb-8">
            VoiceAuth is a Voice Recognition as a Service (VRaaS) platform. Users register their voice once, and developers can integrate voice authentication into their applications with a simple API.
          </p>
          <div class="flex items-center justify-center gap-4">
            <a routerLink="/signup" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              Get Started <mat-icon>arrow_forward</mat-icon>
            </a>
            <a routerLink="/developer" class="bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-xl font-medium hover:bg-zinc-50 transition-colors">
              Developer Docs
            </a>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <mat-icon class="text-indigo-600 mb-4 text-4xl h-10 w-10">mic</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Register Once</h3>
            <p class="text-zinc-600">Users register their voice profile once on our secure platform.</p>
          </div>
          <div class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <mat-icon class="text-indigo-600 mb-4 text-4xl h-10 w-10">api</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Easy Integration</h3>
            <p class="text-zinc-600">Developers generate an API key and integrate voice auth in minutes.</p>
          </div>
          <div class="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <mat-icon class="text-indigo-600 mb-4 text-4xl h-10 w-10">verified_user</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Secure Authentication</h3>
            <p class="text-zinc-600">Identify users securely using their unique biometric voice data.</p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class LandingComponent {}
