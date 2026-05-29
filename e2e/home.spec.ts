import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState('networkidle');
});

test('renders clock with current time in 24h format', async ({ page }) => {
	await expect(page.getByText(/\d{2}:\d{2}/).first()).toBeVisible();
});

test('switches to Chinese locale and updates date format', async ({ page }) => {
	await page.locator('[data-umami-event="switch-lang-zh"]').click();
	await page.waitForTimeout(150);
	await expect(page.locator('span.text-3xl').first()).toContainText(/年/);

	const locale = await page.evaluate(
		() => JSON.parse(localStorage.getItem('FL_preferences') || '{}').locale
	);
	expect(locale).toBe('zh');
});

test('switches to English locale and updates date format', async ({ page }) => {
	await page.locator('[data-umami-event="switch-lang-zh"]').click();
	await page.waitForTimeout(150);
	await page.locator('[data-umami-event="switch-lang-en"]').click();
	await page.waitForTimeout(150);

	await expect(page.locator('span.text-3xl').first()).toContainText(new Date().getFullYear().toString());

	const locale = await page.evaluate(
		() => JSON.parse(localStorage.getItem('FL_preferences') || '{}').locale
	);
	expect(locale).toBe('en');
});
