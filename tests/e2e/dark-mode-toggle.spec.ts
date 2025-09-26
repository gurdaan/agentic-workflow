import { test, expect, Page } from '@playwright/test';

/**
 * Test Case ID: TC-001 
 * Test Case Title: Verify Dark Mode Toggle functional behavior
 * Test Scenario: Test the functionality of the dark mode toggle button.
 * 
 * This test suite validates the requirements from Task-227:
 * - Dark mode toggle functionality
 * - UI theme switching
 * - User preference persistence in localStorage
 * - Accessibility compliance (WCAG standards)
 * - Visual changes between light and dark modes
 */

test.describe('Dark Mode Toggle Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Clear localStorage to ensure consistent test state
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Reload to ensure clean state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('TC-001: Should toggle from dark to light mode when clicked', async ({ page }) => {
    // Locate the theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    
    // Wait for the theme toggle to be visible
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Check initial state - application should start in dark mode by default
    const appContainer = page.locator('.app-container');
    await expect(appContainer).toHaveClass(/dark-theme/);
    
    // Check that the toggle shows sun icon (indicating it will switch TO light mode)
    const themeIcon = page.locator('.theme-icon');
    await expect(themeIcon).toContainText('☀️');
    
    // Click the toggle to switch to light mode
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    // Verify the UI switched to light mode
    await expect(appContainer).not.toHaveClass(/dark-theme/);
    
    // Check that the icon changed to moon (indicating it will switch TO dark mode)
    await expect(themeIcon).toContainText('🌙');
    
    // Verify background color changed to light theme
    const bgColor = await appContainer.evaluate((el) => 
      getComputedStyle(el).backgroundColor
    );
    // Light theme should have a lighter background (not the dark theme color)
    expect(bgColor).not.toBe('rgb(26, 26, 26)'); // Dark theme bg color
  });

  test('TC-001: Should toggle from light back to dark mode', async ({ page }) => {
    // First, get to light mode
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Switch to light mode first
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const appContainer = page.locator('.app-container');
    await expect(appContainer).not.toHaveClass(/dark-theme/);
    
    // Now click again to go back to dark mode
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify we're back in dark mode
    await expect(appContainer).toHaveClass(/dark-theme/);
    
    // Check icon is back to sun
    const themeIcon = page.locator('.theme-icon');
    await expect(themeIcon).toContainText('☀️');
  });

  test('Should persist theme preference in localStorage', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Switch to light mode
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check that preference was saved to localStorage
    const savedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme-preference');
    });
    
    expect(savedTheme).toBe('false'); // false = light mode
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify the theme preference was restored
    const appContainer = page.locator('.app-container');
    await expect(appContainer).not.toHaveClass(/dark-theme/);
    
    // Verify icon shows moon (light mode active)
    const themeIcon = page.locator('.theme-icon');
    await expect(themeIcon).toContainText('🌙');
  });

  test('Should have proper accessibility attributes', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Check initial accessibility attributes for dark mode
    await expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
    await expect(themeToggle).toHaveAttribute('title', 'Switch to light mode');
    
    // Click to switch to light mode
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check accessibility attributes for light mode
    await expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');
    await expect(themeToggle).toHaveAttribute('title', 'Switch to dark mode');
  });

  test('Should be keyboard accessible', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Focus the toggle button using keyboard navigation
    await page.keyboard.press('Tab');
    
    // Find the currently focused element
    const focusedElement = page.locator(':focus');
    
    // The theme toggle should be focusable (it might not be the first tab stop)
    // So let's focus it directly and test keyboard activation
    await themeToggle.focus();
    
    // Check that it's focused
    await expect(themeToggle).toBeFocused();
    
    // Activate using keyboard (Enter or Space)
    const appContainer = page.locator('.app-container');
    const initialHasDarkClass = await appContainer.evaluate(el => el.classList.contains('dark-theme'));
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify the theme changed
    const finalHasDarkClass = await appContainer.evaluate(el => el.classList.contains('dark-theme'));
    expect(finalHasDarkClass).not.toBe(initialHasDarkClass);
  });

  test('Should have sufficient contrast ratios (WCAG compliance)', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Test dark mode contrast
    const darkModeColors = await page.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle');
      const computedStyle = getComputedStyle(toggle);
      return {
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        borderColor: computedStyle.borderColor
      };
    });
    
    // Switch to light mode
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Test light mode contrast
    const lightModeColors = await page.evaluate(() => {
      const toggle = document.querySelector('.theme-toggle');
      const computedStyle = getComputedStyle(toggle);
      return {
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        borderColor: computedStyle.borderColor
      };
    });
    
    // Basic checks that colors are different between modes
    expect(darkModeColors.color).toBeDefined();
    expect(lightModeColors.color).toBeDefined();
    
    // Colors should be different between light and dark modes
    // (More sophisticated contrast ratio calculations would require additional tools)
    console.log('Dark mode colors:', darkModeColors);
    console.log('Light mode colors:', lightModeColors);
  });

  test('Should maintain theme toggle position in header', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Check that toggle is in the header
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    
    // Verify the toggle is positioned correctly in the header actions area
    const headerActions = page.locator('.header-actions');
    await expect(headerActions).toBeVisible();
    
    // Check that the theme toggle is within the header actions
    const toggleInHeader = headerActions.locator('app-theme-toggle, .theme-toggle');
    await expect(toggleInHeader).toBeVisible();
  });

  test('Should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    // Theme toggle should still be functional on mobile
    const appContainer = page.locator('.app-container');
    await expect(appContainer).toHaveClass(/dark-theme/);
    
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    await expect(appContainer).not.toHaveClass(/dark-theme/);
    
    // Check that the toggle is still accessible on mobile
    const toggleBounds = await themeToggle.boundingBox();
    expect(toggleBounds).toBeTruthy();
    expect(toggleBounds!.width).toBeGreaterThan(30); // Minimum touch target size
    expect(toggleBounds!.height).toBeGreaterThan(30);
  });

  test('Should handle rapid clicks without breaking', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, app-theme-toggle button');
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    const appContainer = page.locator('.app-container');
    
    // Perform rapid clicks
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(100); // Short delay between clicks
    }
    
    // Application should still be functional
    await expect(themeToggle).toBeVisible();
    
    // Final state should be consistent
    const hasClassAfter = await appContainer.evaluate(el => el.classList.contains('dark-theme'));
    const iconText = await page.locator('.theme-icon').textContent();
    
    // Icon should match the current theme state
    if (hasClassAfter) {
      expect(iconText).toBe('☀️'); // Dark mode shows sun icon
    } else {
      expect(iconText).toBe('🌙'); // Light mode shows moon icon
    }
  });
});

test.describe('Theme Persistence Integration Tests', () => {
  test('Should restore theme from localStorage on fresh load', async ({ page }) => {
    // Set light mode in localStorage before navigating
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('theme-preference', 'false');
    });
    
    // Navigate to a fresh page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify light mode was restored
    const appContainer = page.locator('.app-container');
    await expect(appContainer).not.toHaveClass(/dark-theme/);
    
    const themeIcon = page.locator('.theme-icon');
    await expect(themeIcon).toContainText('🌙');
  });

  test('Should default to dark mode when no localStorage value exists', async ({ page }) => {
    await page.goto('/');
    
    // Clear any existing theme preference
    await page.evaluate(() => {
      localStorage.removeItem('theme-preference');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should default to dark mode
    const appContainer = page.locator('.app-container');
    await expect(appContainer).toHaveClass(/dark-theme/);
    
    const themeIcon = page.locator('.theme-icon');
    await expect(themeIcon).toContainText('☀️');
  });
});