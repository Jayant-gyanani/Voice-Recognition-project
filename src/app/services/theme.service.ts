import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Check local storage or system preference
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        this.isDarkMode.set(true);
      } else {
        this.isDarkMode.set(false);
      }

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.isDarkMode.set(e.matches);
        }
      });

      // Apply theme whenever it changes
      effect(() => {
        const isDark = this.isDarkMode();
        if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}
