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

/**
 * jsdom implements no Web Animations API, which Svelte transitions require
 * (`element.animate`). The stub completes each animation on the next task by
 * invoking the `onfinish` handler Svelte attaches right after the call, so a
 * transition settles into its final state instead of leaving the element in
 * limbo (intro) or in the DOM (outro).
 */
const elementProto = Element.prototype as unknown as { animate?: unknown };
if (!elementProto.animate) {
	elementProto.animate = function () {
		const animation: { onfinish: (() => void) | null; cancel: () => void } = {
			onfinish: null,
			cancel: () => {},
		};
		setTimeout(() => animation.onfinish?.(), 0);
		return animation;
	};
}

const msgHandler: ProxyHandler<object> = { get: (_, key) => () => String(key) };
const m = new Proxy({}, msgHandler);

vi.mock('$lib/paraglide/messages.js', () => ({ m }));
vi.mock('$lib/paraglide/runtime.js', () => ({
	getLocale: () => 'en',
	setLocale: () => {},
	localizeHref: (href: string) => href,
}));
vi.mock('$app/navigation', () => ({ goto: () => {} }));
