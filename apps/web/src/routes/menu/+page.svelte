<script lang="ts">
	import { t, locale } from '$i18n';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import { RESTAURANT_SLUG } from '$lib/stores/restaurant.svelte';
	import { menuItems as fallbackItems, categories as fallbackCategories } from '$lib/menu-data';
	import { cart } from '$lib/stores/cart.svelte';
	import { Star, Leaf, Flame, Plus, Minus, ShoppingCart, Check, AlertCircle } from 'lucide-svelte';
	import MenuSkeleton from '$components/MenuSkeleton.svelte';

	const restaurant = useQuery(api.restaurants.getBySlug, { slug: RESTAURANT_SLUG });

	const categoriesQuery = useQuery(
		api.categories.listActiveByRestaurant,
		() => (restaurant.data?._id ? { restaurantId: restaurant.data._id } : 'skip')
	);

	const menuItemsQuery = useQuery(
		api.menuItems.listByRestaurant,
		() => (restaurant.data?._id ? { restaurantId: restaurant.data._id, onlyAvailable: true } : 'skip')
	);

	let activeCategory = $state('all');
	let justAdded = $state<string | null>(null);

	// Use Convex data when available, fall back to static data
	const categories = $derived(
		categoriesQuery.data ?? fallbackCategories.map((c) => ({ ...c, _id: c.id }))
	);

	const allItems = $derived(menuItemsQuery.data ?? fallbackItems);

	const filteredItems = $derived(
		activeCategory === 'all'
			? allItems
			: allItems.filter((i: any) => {
					// Match by categoryId (Convex) or category string (fallback)
					if (i.categoryId) return i.categoryId === activeCategory;
					return i.category === activeCategory;
				})
	);

	function getItemId(item: any): string {
		return item._id ?? item.id;
	}

	function getItemEmoji(item: any): string {
		if (item.imageUrl) return '';
		if (item.category) {
			const map: Record<string, string> = { appetizers: '🥟', mains: '🍛', drinks: '☕', desserts: '🍮' };
			return map[item.category] || '🍽️';
		}
		if (item.isVeg) return '🥬';
		return '🍛';
	}

	function getCategoryId(cat: any): string {
		return cat._id ?? cat.id;
	}

	function handleAddToCart(item: any) {
		const id = getItemId(item);
		cart.addItem(id, item.name, item.nameNe || '', item.price);
		justAdded = id;
		setTimeout(() => {
			if (justAdded === id) justAdded = null;
		}, 1200);
	}

	function getCartQty(item: any): number {
		return cart.items.find((i) => i.menuItemId === getItemId(item))?.quantity ?? 0;
	}
</script>

<svelte:head>
	<title>{$t('menu.title')} — {$t('site.name')}</title>
	<meta name="description" content={$t('menu.subtitle')} />
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6">
		<h1 class="font-[var(--font-display)] text-5xl font-bold text-white">
			{$t('menu.title')}
		</h1>
		<p class="mt-4 text-lg text-white/70">
			{$t('menu.subtitle')}
		</p>
	</div>
</section>

<section class="bg-background py-12">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		{#if menuItemsQuery.isLoading && !menuItemsQuery.data}
			<MenuSkeleton />
		{:else if menuItemsQuery.error && !menuItemsQuery.data}
			<div class="rounded-2xl border border-border bg-card py-16 text-center">
				<AlertCircle class="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
				<h2 class="text-lg font-semibold text-foreground">Unable to load menu</h2>
				<p class="mt-2 text-sm text-muted-foreground">Please check your connection and try again.</p>
				<button
					onclick={() => location.reload()}
					class="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
				>
					Retry
				</button>
			</div>
		{:else}
			<!-- Category Filter -->
			<div class="mb-12 flex flex-wrap justify-center gap-3">
				<button
					class="rounded-full px-5 py-2.5 text-sm font-medium transition-all {activeCategory === 'all'
						? 'bg-primary text-primary-foreground shadow-lg'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
					onclick={() => (activeCategory = 'all')}
				>
					{$t('menu.all')}
				</button>
				{#each categories as cat}
					<button
						class="rounded-full px-5 py-2.5 text-sm font-medium transition-all {activeCategory === getCategoryId(cat)
							? 'bg-primary text-primary-foreground shadow-lg'
							: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
						onclick={() => (activeCategory = getCategoryId(cat))}
					>
						{$locale === 'ne' ? (cat.nameNe || cat.name) : cat.name}
					</button>
				{/each}
			</div>

			<!-- Menu Grid -->
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredItems as item (getItemId(item))}
					{@const id = getItemId(item)}
					{@const qty = getCartQty(item)}
					<div
						class="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="relative flex h-40 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20"
						>
							{#if item.imageUrl || item.image}
								<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
							{:else}
								<span class="text-6xl transition-transform duration-300 group-hover:scale-110">
									{getItemEmoji(item)}
								</span>
							{/if}
							{#if qty > 0}
								<div
									class="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md"
								>
									{qty}
								</div>
							{/if}
						</div>
						<div class="p-6">
							<div class="mb-2 flex flex-wrap gap-2">
								{#if item.popular}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
									>
										<Star class="h-3 w-3" />
										{$t('menu.popular')}
									</span>
								{/if}
								{#if item.isVeg || item.vegetarian}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
									>
										<Leaf class="h-3 w-3" />
										{$t('menu.veg')}
									</span>
								{/if}
								{#if item.isSpicy || item.spicy}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
									>
										<Flame class="h-3 w-3" />
										{$t('menu.spicy')}
									</span>
								{/if}
							</div>
							<h3 class="text-lg font-semibold text-foreground">
								{$locale === 'ne' ? (item.nameNe || item.name) : item.name}
							</h3>
							<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
								{$locale === 'ne' ? (item.descriptionNe || item.description || '') : (item.description || '')}
							</p>
							<div class="mt-4 flex items-center justify-between">
								<span class="text-xl font-bold text-primary">Rs. {item.price}</span>

								{#if qty > 0}
									<div class="flex items-center gap-2">
										<button
											class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
											onclick={() => cart.updateQuantity(id, qty - 1)}
										>
											<Minus class="h-3.5 w-3.5" />
										</button>
										<span class="w-6 text-center text-sm font-semibold text-foreground">{qty}</span>
										<button
											class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
											onclick={() => cart.updateQuantity(id, qty + 1)}
										>
											<Plus class="h-3.5 w-3.5" />
										</button>
									</div>
								{:else}
									<button
										class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all {justAdded === id
											? 'bg-green-500 text-white'
											: 'bg-primary text-primary-foreground hover:bg-primary/90'} shadow-md hover:shadow-lg"
										onclick={() => handleAddToCart(item)}
									>
										{#if justAdded === id}
											<Check class="h-4 w-4" />
											{$t('menu.added')}
										{:else}
											<Plus class="h-4 w-4" />
											{$t('menu.addToCart')}
										{/if}
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Floating Cart Button -->
{#if cart.itemCount > 0}
	<a
		href="/order"
		class="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white shadow-2xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:shadow-orange-500/40"
	>
		<div class="relative">
			<ShoppingCart class="h-5 w-5" />
			<span
				class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-orange-600 dark:bg-orange-100"
			>
				{cart.itemCount}
			</span>
		</div>
		<span class="font-semibold">Rs. {cart.total}</span>
	</a>
{/if}
