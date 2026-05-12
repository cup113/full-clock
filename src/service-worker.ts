/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

const CACHE = `clock-${version}`;
const ASSETS = [...build, ...files, ...prerendered];

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(CACHE).then((c) => c.addAll(ASSETS))
	);
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
		).then(() => self.clients.claim())
	);
});

self.addEventListener('message', (e) => {
	if (e.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

self.addEventListener('fetch', (e) => {
	if (e.request.method !== 'GET') return;
	const url = new URL(e.request.url);
	if (url.origin !== location.origin) return;

	e.respondWith(
		caches.match(e.request).then((cached) => cached ?? fetch(e.request))
	);
});
