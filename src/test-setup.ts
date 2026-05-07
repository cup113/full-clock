import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';

afterEach(() => {
	cleanup();
});

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const msgHandler: ProxyHandler<object> = { get: (_, key) => () => String(key) };
const m = new Proxy({}, msgHandler);

vi.mock('$lib/paraglide/messages.js', () => ({ m }));
vi.mock('$lib/paraglide/runtime.js', () => ({
	getLocale: () => 'en',
	setLocale: () => {},
	localizeHref: (href: string) => href
}));
vi.mock('$app/navigation', () => ({ goto: () => {} }));
