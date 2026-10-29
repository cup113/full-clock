import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { VERSION } from '../version';

// vitest runs with the project root as cwd
const root = process.cwd();

function read(relative: string): string {
	return readFileSync(join(root, relative), 'utf8');
}

describe('version consistency', () => {
	it('keeps package.json, version.ts and Cargo.toml in sync', () => {
		const pkg = JSON.parse(read('package.json')) as { version: string };
		const cargo = /^version\s*=\s*"([^"]+)"/m.exec(read('src-tauri/Cargo.toml'))?.[1];

		expect(cargo).toBeDefined();
		expect(VERSION).toBe(pkg.version);
		expect(cargo).toBe(pkg.version);
	});

	it('lets tauri.conf.json inherit the version from Cargo.toml', () => {
		const conf = JSON.parse(read('src-tauri/tauri.conf.json')) as Record<string, unknown>;

		// Omitting `version` is what makes Tauri read it from Cargo.toml — keep it that way
		// so a future bump only has to touch package.json, version.ts and Cargo.toml.
		expect(conf).not.toHaveProperty('version');
	});
});
