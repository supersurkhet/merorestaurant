<script lang="ts">
	import '$lib/../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ConvexProvider from '$lib/components/ConvexProvider.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getRestaurant } from '$lib/stores/restaurant.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { useQuery, api } from '$lib/convex';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	const theme = getTheme();
	const auth = getAuth();
	const restaurant = getRestaurant();
	const i18n = getI18n();

	// Resolve restaurantId from slug
	const restaurantQuery = useQuery(api.restaurants.getBySlug, {
		slug: restaurant.slug
	});

	$effect(() => {
		if (restaurantQuery.data && !restaurantQuery.isLoading) {
			restaurant.setId((restaurantQuery.data as any)._id);
		}
	});

	onMount(() => {
		theme.init();
	});

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) {
			switch (e.key.toLowerCase()) {
				case 'k':
					e.preventDefault();
					goto('/kitchen');
					break;
				case 't':
					if (!e.shiftKey) {
						e.preventDefault();
						goto('/tables');
					}
					break;
				case 'm':
					e.preventDefault();
					goto('/menu');
					break;
			}
		}
	}

	const isAuthPage = $derived($page.url.pathname === '/auth');
</script>

<svelte:window onkeydown={handleKeydown} />

<ConvexProvider>
	{#if isAuthPage}
		<ErrorBoundary>
			{@render children()}
		</ErrorBoundary>
	{:else if !auth.isAuthenticated && !auth.isLoading}
		{@render children()}
	{:else}
		<div class="flex h-screen overflow-hidden bg-background">
			<Sidebar />
			<main class="flex-1 overflow-y-auto">
				{#if restaurantQuery.isLoading}
					<div class="flex h-full items-center justify-center">
						<div class="text-center space-y-3">
							<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
							<p class="text-sm text-muted-foreground">{i18n.t('app.connecting')}</p>
						</div>
					</div>
				{:else}
					<ErrorBoundary>
						{@render children()}
					</ErrorBoundary>
				{/if}
			</main>
		</div>
	{/if}
</ConvexProvider>
