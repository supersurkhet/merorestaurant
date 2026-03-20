<script lang="ts">
	import '$lib/../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	const theme = getTheme();

	onMount(() => {
		theme.init();
	});
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<Sidebar />
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
