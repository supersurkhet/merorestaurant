<script lang="ts">
	import { t, locale } from '$i18n';
	import { menuItems, categories } from '$lib/menu-data';
	import { Star, Leaf, Flame } from 'lucide-svelte';

	let activeCategory = $state('all');

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
				<div
					class="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div
						class="flex h-40 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20"
					>
						<span class="text-6xl transition-transform duration-300 group-hover:scale-110">
							{emojiMap[item.category] || '🍽️'}
						</span>
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
						<div class="mt-4">
							<span class="text-xl font-bold text-primary">Rs. {item.price}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
