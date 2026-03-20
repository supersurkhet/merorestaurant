<script lang="ts">
	import { setupConvex, CONVEX_URL } from '$lib/convex';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	setupConvex(CONVEX_URL);
</script>

{@render children()}
