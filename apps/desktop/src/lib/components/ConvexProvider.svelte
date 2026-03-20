<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getConvexClient, closeConvexClient } from '$lib/convex';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	let connected = $state(false);

	onMount(() => {
		try {
			getConvexClient();
			connected = true;
		} catch (e) {
			console.warn('[ConvexProvider] Could not connect to Convex:', e);
			// App still works with mock data
			connected = false;
		}
	});

	onDestroy(() => {
		closeConvexClient();
	});
</script>

{@render children()}
