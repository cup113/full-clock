// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Umami {
		track(event: string, data?: Record<string, unknown>): void;
	}

	interface Window {
		umami?: Umami;
	}
}

export {};
