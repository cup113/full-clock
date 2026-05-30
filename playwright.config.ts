import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	timeout: 60000,
	webServer: {
		command: 'pnpm preview --port 4173',
		port: 4173,
		reuseExistingServer: true,
	},
	use: { baseURL: 'http://localhost:4173' },
});
