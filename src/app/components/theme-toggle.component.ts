import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
      [title]="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <span class="theme-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 1.2rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: var(--text);
    }

    .theme-toggle:hover { 
      background: var(--border); 
      transform: scale(1.05);
    }

    .theme-toggle:active {
      transform: scale(0.95);
    }

    .theme-icon {
      transition: transform 0.3s ease;
    }

    .theme-toggle:hover .theme-icon {
      transform: rotate(15deg);
    }
  `]
})
export class ThemeToggleComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  isDarkTheme = true;

  constructor(private themeService: ThemeService) {
    // Subscribe to theme changes
    this.themeService.isDarkTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkTheme = isDark;
      });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}