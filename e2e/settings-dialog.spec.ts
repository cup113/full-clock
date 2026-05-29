import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState('networkidle');
});

test('opens settings dialog and shows title', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();

	await expect(page.getByRole('dialog')).toBeVisible();
});

test('closes settings dialog via backdrop click', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();
	await expect(page.getByRole('dialog')).toBeVisible();

	await page.locator('[role="dialog"]').click({ position: { x: 5, y: 5 } });
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('closes settings dialog via Escape key', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();
	await expect(page.getByRole('dialog')).toBeVisible();

	await page.locator('[role="dialog"]').focus();
	await page.keyboard.press('Escape');
	await page.waitForTimeout(100);
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('does not close settings dialog when clicking inside the panel', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();
	await expect(page.getByRole('dialog')).toBeVisible();

	await page.locator('[role="dialog"] [role="presentation"]').click();
	await expect(page.getByRole('dialog')).toBeVisible();
});
