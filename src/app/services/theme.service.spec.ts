import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default dark theme when no localStorage value exists', () => {
    expect(service.isDarkTheme).toBe(true);
  });

  it('should restore theme from localStorage', () => {
    // Set up localStorage before creating service
    localStorage.setItem('theme-preference', 'false');
    
    // Create new service instance
    service = TestBed.inject(ThemeService);
    
    expect(service.isDarkTheme).toBe(false);
  });

  it('should toggle theme from dark to light', () => {
    expect(service.isDarkTheme).toBe(true);
    
    service.toggleTheme();
    
    expect(service.isDarkTheme).toBe(false);
  });

  it('should toggle theme from light to dark', () => {
    service.setTheme(false); // Set to light mode first
    expect(service.isDarkTheme).toBe(false);
    
    service.toggleTheme();
    
    expect(service.isDarkTheme).toBe(true);
  });

  it('should save theme preference to localStorage', () => {
    service.setTheme(false);
    
    const saved = localStorage.getItem('theme-preference');
    expect(saved).toBe('false');
  });

  it('should emit theme changes via observable', (done) => {
    service.isDarkTheme$.subscribe(isDark => {
      if (!isDark) { // Wait for the change to light mode
        expect(isDark).toBe(false);
        done();
      }
    });
    
    service.setTheme(false);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    spyOn(localStorage, 'setItem').and.throwError('Storage error');
    
    // Should not throw an error
    expect(() => service.setTheme(false)).not.toThrow();
  });
});