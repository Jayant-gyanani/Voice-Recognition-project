import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Light</span>
      <button 
        (click)="themeService.toggleTheme()" 
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-purple-500 dark:focus:ring-offset-zinc-900"
        [class.bg-zinc-200]="!themeService.isDarkMode()"
        [class.bg-purple-600]="themeService.isDarkMode()"
        role="switch"
        [attr.aria-checked]="themeService.isDarkMode()"
        aria-label="Toggle theme">
        <span 
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
          [class.translate-x-1]="!themeService.isDarkMode()"
          [class.translate-x-6]="themeService.isDarkMode()"
        ></span>
      </button>
      <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Dark</span>
    </div>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
