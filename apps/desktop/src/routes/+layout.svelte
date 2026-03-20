<script lang="ts">
	import '$lib/../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ConvexProvider from '$lib/components/ConvexProvider.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { getRestaurant } from '$lib/stores/restaurant.svelte';
	import { useQuery, api } from '$lib/convex';
	import { onMount } from 'svelte';

	let { children } = $props();

	const theme = getTheme();
	const restaurant = getRestaurant();

	// Resolve restaurantId from slug
	const restaurantQuery = useQuery(api.restaurants.getBySlug, {
		slug: restaurant.slug
	});

	// Set restaurantId when resolved
	$effect(() => {
		if (restaurantQuery.data && !restaurantQuery.isLoading) {
			restaurant.setId((restaurantQuery.data as any)._id);
		}
	});

	onMount(() => {
		theme.init();
	});
</script>

<ConvexProvider>
	<div class="flex h-screen overflow-hidden bg-background">
		<Sidebar />
		<main class="flex-1 overflow-y-auto">
			{#if restaurantQuery.isLoading}
				<div class="flex h-full items-center justify-center">
					<div class="text-center space-y-3">
						<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
						<p class="text-sm text-muted-foreground">Connecting to Mero Restaurant...</p>
					</div>
				</div>
			{:else}
				{@render children()}
			{/if}
		</main>
	</div>
</ConvexProvider>
