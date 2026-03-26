import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './services/theme.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  themeService = inject(ThemeService);
}
