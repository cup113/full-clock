import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { interceptExternalLinks, isExternalHref, openExternal } from '../external-links';

/**
 * Installs (or removes) a fake Tauri runtime, as in `time.test.ts`:
 * `@tauri-apps/api`'s `invoke` is a thin forwarder to
 * `window.__TAURI_INTERNALS__.invoke`, so this exercises the real client.
 */
function setTauri(active: boolean, invoke = vi.fn()) {
	const w = window as unknown as Record<string, unknown>;
	if (active) w.__TAURI_INTERNALS__ = { invoke };
	else delete w.__TAURI_INTERNALS__;
	return invoke;
}

function anchor(href: string): HTMLAnchorElement {
	const a = document.createElement('a');
	a.setAttribute('href', href);
	a.target = '_blank';
	a.textContent = href;
	document.body.append(a);
	return a;
}

function clickOn(element: Element): MouseEvent {
	const event = new MouseEvent('click', { bubbles: true, cancelable: true });
	element.dispatchEvent(event);
	return event;
}

let dispose: (() => void) | undefined;

beforeEach(() => {
	setTauri(false);
});

afterEach(() => {
	dispose?.();
	dispose = undefined;
	setTauri(false);
	document.body.innerHTML = '';
});

describe('isExternalHref', () => {
	const cases: Array<[string, boolean]> = [
		['https://github.com/cup113/full-clock', true],
		['https://f.kdocs.cn/g/iuGauWIo/', true],
		['HTTPS://EXAMPLE.COM', true],
		['http://example.com/', true],
		['/', false],
		['/zh/about', false],
		['#top', false],
		['mailto:someone@example.com', false],
	];

	it.each(cases)('%s → %s', (href, expected) => {
		expect(isExternalHref(href)).toBe(expected);
	});
});

describe('interceptExternalLinks', () => {
	it('sends an external link to the system browser', () => {
		setTauri(true);
		const open = vi.fn();
		dispose = interceptExternalLinks(open);

		const event = clickOn(anchor('https://github.com/cup113/full-clock'));

		expect(event.defaultPrevented).toBe(true);
		expect(open).toHaveBeenCalledWith('https://github.com/cup113/full-clock');
	});

	it('leaves in-app links to the router', () => {
		setTauri(true);
		const open = vi.fn();
		dispose = interceptExternalLinks(open);

		// `/zh` resolves to `http://tauri.localhost/zh` in the shell, which is
		// why the raw attribute is what gets tested.
		const event = clickOn(anchor('/zh'));

		expect(event.defaultPrevented).toBe(false);
		expect(open).not.toHaveBeenCalled();
	});

	it('catches anchors injected as HTML, not just compiled ones', () => {
		setTauri(true);
		const open = vi.fn();
		dispose = interceptExternalLinks(open);

		const container = document.createElement('div');
		container.innerHTML =
			'<p><a href="https://api.shijian.online" target="_blank">api.shijian.online</a></p>';
		document.body.append(container);
		const link = container.querySelector('a');
		if (!link) throw new Error('fixture anchor missing');

		const event = clickOn(link);

		expect(event.defaultPrevented).toBe(true);
		expect(open).toHaveBeenCalledWith(expect.stringContaining('api.shijian.online'));
	});

	it('does nothing outside the shell', () => {
		const open = vi.fn();
		dispose = interceptExternalLinks(open);

		const event = clickOn(anchor('https://example.com'));

		expect(event.defaultPrevented).toBe(false);
		expect(open).not.toHaveBeenCalled();
	});

	it('stops intercepting once disposed', () => {
		setTauri(true);
		const open = vi.fn();
		interceptExternalLinks(open)();

		const event = clickOn(anchor('https://example.com'));

		expect(event.defaultPrevented).toBe(false);
		expect(open).not.toHaveBeenCalled();
	});
});

describe('openExternal', () => {
	it('reaches the opener plugin command', async () => {
		const invoke = setTauri(true);

		await openExternal('https://example.com/');

		expect(invoke).toHaveBeenCalledTimes(1);
		const [command, args] = invoke.mock.calls[0] as [string, { url: string }];
		expect(command).toContain('open_url');
		expect(args.url).toBe('https://example.com/');
	});
});
