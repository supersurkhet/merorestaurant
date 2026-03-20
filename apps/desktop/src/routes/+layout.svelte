<script lang="ts">
	import '$lib/../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ConvexProvider from '$lib/components/ConvexProvider.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getRestaurant } from '$lib/stores/restaurant.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	const theme = getTheme();
	const auth = getAuth();
	const restaurant = getRestaurant();
	const i18n = getI18n();

	onMount(() => {
		theme.init();
	});

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) {
			switch (e.key.toLowerCase()) {
				case 'k': e.preventDefault(); goto('/kitchen'); break;
				case 't': if (!e.shiftKey) { e.preventDefault(); goto('/tables'); } break;
				case 'm': e.preventDefault(); goto('/menu'); break;
			}
		}
	}

	// Pages that don't need sidebar/restaurant context
	const fullScreenPages = ['/auth', '/select', '/onboard'];
	const isFullScreen = $derived(fullScreenPages.some((p) => $page.url.pathname.startsWith(p)));
	const isAuthPage = $derived($page.url.pathname === '/auth');
</script>

<svelte:window onkeydown={handleKeydown} />

<ConvexProvider>
	{#if isFullScreen}
		<ErrorBoundary>
			{@render children()}
		</ErrorBoundary>
	{:else if !auth.isAuthenticated && !auth.isLoading}
		<!-- Not logged in, redirect will happen -->
		{@render children()}
	{:else if !restaurant.id}
		<!-- Logged in but no restaurant selected -->
		{@render children()}
	{:else}
		<div class="flex h-screen overflow-hidden bg-background">
			<Sidebar />
			<main class="flex-1 overflow-y-auto">
				<ErrorBoundary>
					{@render children()}
				</ErrorBoundary>
			</main>
		</div>
	{/if}
</ConvexProvider>
