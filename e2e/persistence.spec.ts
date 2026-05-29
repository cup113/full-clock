import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForLoadState('networkidle');
});

test('persists time format 12h across reload', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();
	await page.locator('[data-umami-event="set-timeformat-12h"]').click();
	await page.locator('[data-umami-event="close-settings"]').click();
	await page.waitForTimeout(300);

	await page.reload();
	await page.waitForLoadState('networkidle');

	await expect(page.getByText(/AM|PM/)).toBeVisible();
});

test('persists background color change across reload', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();

	await page
		.locator('[data-umami-event="apply-color-preset"][data-umami-event-preset="midnight"]')
		.click();
	await page.locator('[data-umami-event="close-settings"]').click();
	await page.waitForTimeout(300);
	await page.reload();
	await page.waitForLoadState('networkidle');

	const prefs = await page.evaluate(() =>
		JSON.parse(localStorage.getItem('FL_preferences') || '{}')
	);
	expect(prefs.background).toBe('#0a0a23');
});

test('persists secondStyle off across reload', async ({ page }) => {
	await page.locator('[data-umami-event="open-settings"]').click();
	await page.locator('[data-umami-event="set-secondstyle-off"]').click();
	await page.locator('[data-umami-event="close-settings"]').click();
	await page.waitForTimeout(300);
	await page.reload();
	await page.waitForLoadState('networkidle');

	const prefs = await page.evaluate(() =>
		JSON.parse(localStorage.getItem('FL_preferences') || '{}')
	);
	expect(prefs.secondStyle).toBe('off');
});

test('persists custom title across reload', async ({ page }) => {
	const customTitle = 'Hello World';

	await page.locator('[data-umami-event="open-settings"]').click();
	await page.locator('[data-umami-event="set-titlestyle-custom"]').click();
	await page.locator('[data-umami-event="edit-title-custom"]').fill(customTitle);
	await page.locator('[data-umami-event="close-settings"]').click();
	await page.waitForTimeout(300);
	await page.reload();
	await page.waitForLoadState('networkidle');

	await expect(page.getByText(customTitle)).toBeVisible();
});
