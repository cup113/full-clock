import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState('networkidle');
});

test('navigates to about page via help button and shows FAQ', async ({ page }) => {
	await page.locator('[data-umami-event="open-help"]').click();
	await page.waitForLoadState('networkidle');

	await expect(page.locator('h1')).toBeVisible();
	expect(page.url()).toMatch(/about$/);
});

test('returns to home via back button on about page', async ({ page }) => {
	await page.locator('[data-umami-event="open-help"]').click();
	await page.waitForLoadState('networkidle');

	await page.locator('.about-btn').click();
	await page.waitForLoadState('networkidle');

	await expect(page.locator('[role="application"]')).toBeVisible();
});

test('returns to home via Escape key on about page', async ({ page }) => {
	await page.locator('[data-umami-event="open-help"]').click();
	await page.waitForLoadState('networkidle');

	await page.keyboard.press('Escape');
	await page.waitForLoadState('networkidle');

	await expect(page.locator('[role="application"]')).toBeVisible();
});
