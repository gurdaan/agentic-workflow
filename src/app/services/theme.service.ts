import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';
  private readonly DEFAULT_THEME = true; // true for dark, false for light
  
  private isDarkThemeSubject = new BehaviorSubject<boolean>(this.getInitialTheme());
  
  constructor() {
    // Initialize theme from localStorage or default
    this.isDarkThemeSubject.next(this.getInitialTheme());
  }

  /**
   * Observable stream of the current theme state
   */
  get isDarkTheme$(): Observable<boolean> {
    return this.isDarkThemeSubject.asObservable();
  }

  /**
   * Get current theme state synchronously
   */
  get isDarkTheme(): boolean {
    return this.isDarkThemeSubject.value;
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkThemeSubject.value;
    this.setTheme(newTheme);
  }

  /**
   * Set specific theme
   * @param isDark true for dark theme, false for light theme
   */
  setTheme(isDark: boolean): void {
    this.isDarkThemeSubject.next(isDark);
    this.saveThemePreference(isDark);
  }

  /**
   * Get initial theme from localStorage or default
   */
  private getInitialTheme(): boolean {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Error reading theme preference from localStorage:', error);
    }
    return this.DEFAULT_THEME;
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(isDark: boolean): void {
    try {
      localStorage.setItem(this.THEME_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.warn('Error saving theme preference to localStorage:', error);
    }
  }
}