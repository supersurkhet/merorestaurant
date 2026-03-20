<script lang="ts">
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const convexUrl =
		import.meta.env.VITE_PUBLIC_CONVEX_URL ||
		import.meta.env.PUBLIC_CONVEX_URL ||
		'';

	setupConvex(convexUrl);

	// Pass WorkOS access token to Convex for authenticated mutations
	$effect(() => {
		const token = page.data?.accessToken;
		if (token) {
			try {
				const client = useConvexClient();
				client.setAuth(() => Promise.resolve(token));
			} catch {
				// ConvexClient not ready yet
			}
		}
	});
</script>

{@render children()}
