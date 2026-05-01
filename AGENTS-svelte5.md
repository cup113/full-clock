# Skill: Svelte 5 & SvelteKit 2 (Runes + TypeScript)

## 1. Advanced UI Patterns

### Dynamic Classes (Internal `clsx`)

Svelte 5 natively handles objects and arrays in the `class` attribute.

```svelte
<script lang="ts">
	let { active, customClass }: { active: boolean; customClass?: string } = $props();
</script>

<!-- Object: toggles keys based on truthiness -->
<div class={{ 'text-red-500': active, 'opacity-50': !active }}></div>

<!-- Array: flattens and filters truthy values (supports nesting) -->
<div class={['base-style', active && 'bg-blue-500', customClass]}></div>
```

### Function Bindings

Use `bind:property={getter, setter}` for custom validation or transformations.

```svelte
<input bind:value={() => value, (v) => (value = v.trim().toLowerCase())} />

<!-- Read-only dimension bindings use null for getter -->
<div bind:clientWidth={null, (w) => (width = w)}></div>
```

### Snippets (Slot Replacement)

Snippets are reusable UI blocks passed as props. The `children` prop replaces the default `<slot />`.

```svelte
<!-- Child.svelte -->
<script lang="ts">
	let {
		children,
		footer
	}: { children: import('svelte').Snippet; footer: import('svelte').Snippet<[string]> } = $props();
</script>

{@render children()}
{@render footer('Context Data')}

<!-- Parent.svelte -->
<Child>
	Default content here
	{#snippet footer(message)}
		<p>Footer: {message}</p>
	{/snippet}
</Child>
```

_Hint: Don't use `on:click`; use `onclick` now._

---

## 2. State Management: Runes vs. Stores

### When to use Runes (`.svelte.ts`)

Runes are now the default for logic extraction. Use `.svelte.ts` files for shared, universal reactivity.

```ts
// state.svelte.ts
export const auth = $state({ user: null, loggedIn: false });
```

### When to use Stores (`svelte/store`)

Use stores only for:

1. Complex RxJS-like async data streams.
2. Manual control over subscriber notification.
3. Legacy Svelte 4 compatibility.

**Cheat Sheet:**

- `writable(val)`: Read/Write from anywhere.
- `readable(val, (set) => ...)`: Read-only, setup/teardown logic inside.
- `derived(store, ($s) => ...)`: Computed values from other stores.
- `$storeName`: Auto-subscription syntax (only in `.svelte` files).

---

## 3. SvelteKit 2: Routing & Data

### File System Overview (`src/routes/`)

- `+page.svelte`: The UI for a route.
- `+page.ts`: Load function (runs on Server & Client).
- `+page.server.ts`: Load function + Actions (Server only).
- `+layout.svelte`: Wraps child routes. Must include `{@render children()}`.
- `+server.ts`: API Endpoints (GET, POST, etc.).
- `+error.svelte`: UI for errors caught in the current directory or below.

### Standard Data Pattern

```ts
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return { post: await db.getPost(params.slug) };
};
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageProps } from './$types';
	let { data, params }: PageProps = $props();
</script>

<h1>{data.post.title} (Slug: {params.slug})</h1>
```

### API Routes (`+server.ts`)

Return a standard `Response` or use the `json` helper.

```ts
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { a, b } = await request.json();
	return json({ result: a + b });
};
```

---

## 4. Key Constraints & Best Practices

1. **Prop Ownership**: Do not mutate props. If a child must update a parent's state, use `$bindable()` or a callback function.
2. **Reactivity Loss**: Destructuring a `$state` object at the top level breaks reactivity. Access properties directly (e.g., `user.name`) or destructure inside a `$derived` / template.
3. **SSR Safety**: Use `$effect` for code that requires `window` or `document`, as it only runs in the browser.
4. **Type Safety**: Always use `$types` for `data` and `form` props in SvelteKit to ensure sync between `load` and UI.
