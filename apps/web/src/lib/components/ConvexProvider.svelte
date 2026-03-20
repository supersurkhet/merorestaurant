<script lang="ts">
	import { setupConvex } from 'convex-svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Use import.meta.env to avoid build errors when env var isn't set
	const convexUrl = import.meta.env.VITE_PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;

	if (convexUrl) {
		setupConvex(convexUrl);
	}
</script>

{@render children()}
