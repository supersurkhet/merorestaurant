<script lang="ts">
	import { setupConvex } from 'convex-svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Use the real URL if available, otherwise a placeholder that won't connect
	// but allows the Svelte context to be set up (prevents getContext errors during SSR)
	const convexUrl =
		import.meta.env.VITE_PUBLIC_CONVEX_URL ||
		import.meta.env.PUBLIC_CONVEX_URL ||
		'https://placeholder.convex.cloud';

	setupConvex(convexUrl);
</script>

{@render children()}
