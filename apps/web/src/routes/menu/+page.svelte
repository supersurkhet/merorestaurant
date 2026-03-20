<script lang="ts">
	import { t, locale } from '$i18n';
	import { menuItems, categories } from '$lib/menu-data';
	import { cart } from '$lib/stores/cart.svelte';
	import { Star, Leaf, Flame, Plus, Minus, ShoppingCart, Check } from 'lucide-svelte';

	let activeCategory = $state('all');
	let justAdded = $state<string | null>(null);

	const filteredItems = $derived(
		activeCategory === 'all'
			? menuItems
			: menuItems.filter((i) => i.category === activeCategory)
	);

	const emojiMap: Record<string, string> = {
		appetizers: '🥟',
		mains: '🍛',
		drinks: '☕',
		desserts: '🍮'
	};

	function handleAddToCart(item: (typeof menuItems)[0]) {
		cart.addItem(item.id, item.name, item.nameNe, item.price);
		justAdded = item.id;
		setTimeout(() => {
			if (justAdded === item.id) justAdded = null;
		}, 1200);
	}

	function getCartQty(itemId: string): number {
		return cart.items.find((i) => i.menuItemId === itemId)?.quantity ?? 0;
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
		<!-- Category Filter -->
		<div class="mb-12 flex flex-wrap justify-center gap-3">
			<button
				class="rounded-full px-5 py-2.5 text-sm font-medium transition-all {activeCategory === 'all'
					? 'bg-primary text-primary-foreground shadow-lg'
					: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
				onclick={() => (activeCategory = 'all')}
			>
				All
			</button>
			{#each categories as cat}
				<button
					class="rounded-full px-5 py-2.5 text-sm font-medium transition-all {activeCategory === cat.id
						? 'bg-primary text-primary-foreground shadow-lg'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
					onclick={() => (activeCategory = cat.id)}
				>
					{$locale === 'ne' ? cat.nameNe : cat.name}
				</button>
			{/each}
		</div>

		<!-- Menu Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredItems as item (item.id)}
				{@const qty = getCartQty(item.id)}
				<div
					class="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div
						class="relative flex h-40 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20"
					>
						<span class="text-6xl transition-transform duration-300 group-hover:scale-110">
							{emojiMap[item.category] || '🍽️'}
						</span>
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
							{#if item.vegetarian}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
								>
									<Leaf class="h-3 w-3" />
									{$t('menu.veg')}
								</span>
							{/if}
							{#if item.spicy}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
								>
									<Flame class="h-3 w-3" />
									{$t('menu.spicy')}
								</span>
							{/if}
						</div>
						<h3 class="text-lg font-semibold text-foreground">
							{$locale === 'ne' ? item.nameNe : item.name}
						</h3>
						<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
							{$locale === 'ne' ? item.descriptionNe : item.description}
						</p>
						<div class="mt-4 flex items-center justify-between">
							<span class="text-xl font-bold text-primary">Rs. {item.price}</span>

							{#if qty > 0}
								<!-- Quantity controls -->
								<div class="flex items-center gap-2">
									<button
										class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
										onclick={() => cart.updateQuantity(item.id, qty - 1)}
									>
										<Minus class="h-3.5 w-3.5" />
									</button>
									<span class="w-6 text-center text-sm font-semibold text-foreground">{qty}</span>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
										onclick={() => cart.updateQuantity(item.id, qty + 1)}
									>
										<Plus class="h-3.5 w-3.5" />
									</button>
								</div>
							{:else}
								<!-- Add to cart button -->
								<button
									class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all {justAdded === item.id
										? 'bg-green-500 text-white'
										: 'bg-primary text-primary-foreground hover:bg-primary/90'} shadow-md hover:shadow-lg"
									onclick={() => handleAddToCart(item)}
								>
									{#if justAdded === item.id}
										<Check class="h-4 w-4" />
										Added
									{:else}
										<Plus class="h-4 w-4" />
										Add
									{/if}
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
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
				class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-orange-600"
			>
				{cart.itemCount}
			</span>
		</div>
		<span class="font-semibold">Rs. {cart.total}</span>
	</a>
{/if}
