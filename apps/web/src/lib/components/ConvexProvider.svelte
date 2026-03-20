<script lang="ts">
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// setupConvex requires a non-empty string URL
	const convexUrl =
		import.meta.env.VITE_PUBLIC_CONVEX_URL ||
		import.meta.env.PUBLIC_CONVEX_URL ||
		'https://placeholder.convex.cloud';

	setupConvex(convexUrl);

	// Pass auth token to Convex — only on the client
	if (browser) {
		$effect(() => {
			const token = page.data?.accessToken;
			if (token) {
				try {
					const client = useConvexClient();
					client.setAuth(() => Promise.resolve(token));
				} catch {
					// client not ready
				}
			}
		});
	}
</script>

{@render children()}
