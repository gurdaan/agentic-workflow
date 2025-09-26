import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../services/theme.service';
import { BehaviorSubject } from 'rxjs';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let isDarkThemeSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    // Create a BehaviorSubject for theme state
    isDarkThemeSubject = new BehaviorSubject<boolean>(true);
    
    // Create spy object for ThemeService
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      isDarkTheme$: isDarkThemeSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent], // Since it's standalone
      providers: [
        { provide: ThemeService, useValue: themeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct theme state', () => {
    expect(component.isDarkTheme).toBe(true);
  });

  it('should update theme state when service emits new value', () => {
    // Start with dark theme
    expect(component.isDarkTheme).toBe(true);
    
    // Switch to light theme
    isDarkThemeSubject.next(false);
    
    expect(component.isDarkTheme).toBe(false);
  });

  it('should call themeService.toggleTheme when toggle button is clicked', () => {
    const button = fixture.debugElement.nativeElement.querySelector('.theme-toggle');
    
    button.click();
    
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should display correct icon for dark theme', () => {
    component.isDarkTheme = true;
    fixture.detectChanges();
    
    const icon = fixture.debugElement.nativeElement.querySelector('.theme-icon');
    expect(icon.textContent.trim()).toBe('☀️');
  });

  it('should display correct icon for light theme', () => {
    component.isDarkTheme = false;
    fixture.detectChanges();
    
    const icon = fixture.debugElement.nativeElement.querySelector('.theme-icon');
    expect(icon.textContent.trim()).toBe('🌙');
  });

  it('should have correct accessibility attributes for dark theme', () => {
    component.isDarkTheme = true;
    fixture.detectChanges();
    
    const button = fixture.debugElement.nativeElement.querySelector('.theme-toggle');
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
    expect(button.getAttribute('title')).toBe('Switch to light mode');
  });

  it('should have correct accessibility attributes for light theme', () => {
    component.isDarkTheme = false;
    fixture.detectChanges();
    
    const button = fixture.debugElement.nativeElement.querySelector('.theme-toggle');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
    expect(button.getAttribute('title')).toBe('Switch to dark mode');
  });

  it('should clean up subscription on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should have proper button styling classes', () => {
    const button = fixture.debugElement.nativeElement.querySelector('.theme-toggle');
    
    expect(button).toBeTruthy();
    expect(button.classList.contains('theme-toggle')).toBe(true);
  });

  it('should respond to theme service updates correctly', () => {
    // Start with dark theme
    expect(component.isDarkTheme).toBe(true);
    
    // Change to light theme via service
    isDarkThemeSubject.next(false);
    
    expect(component.isDarkTheme).toBe(false);
    
    // Change back to dark theme
    isDarkThemeSubject.next(true);
    
    expect(component.isDarkTheme).toBe(true);
  });
});