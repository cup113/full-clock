import { test, expect } from '@playwright/test';

test('renders page at /zh/ without error', async ({ page }) => {
	const resp = await page.goto('/zh/');
	expect(resp?.status()).toBe(200);
	await expect(page.locator('[data-umami-event="open-settings"]')).toBeVisible();
});

test('renders page at /en/ without error', async ({ page }) => {
	const resp = await page.goto('/en/');
	expect(resp?.status()).toBe(200);
	await expect(page.locator('[data-umami-event="open-settings"]')).toBeVisible();
});

test('renders about page at /zh/about', async ({ page }) => {
	const resp = await page.goto('/zh/about');
	expect(resp?.status()).toBe(200);
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('.about-btn')).toBeVisible();
});

test('renders about page at /en/about', async ({ page }) => {
	const resp = await page.goto('/en/about');
	expect(resp?.status()).toBe(200);
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('.about-btn')).toBeVisible();
});

test('navigates from /zh/ to about page with locale prefix', async ({ page }) => {
	await page.goto('/zh/');
	await page.waitForLoadState('networkidle');

	await page.locator('[data-umami-event="open-help"]').click();
	await page.waitForTimeout(500);

	await expect(page.locator('h1')).toBeVisible();
});
