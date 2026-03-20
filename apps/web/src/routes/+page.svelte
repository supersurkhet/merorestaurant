<script lang="ts">
	import { t, locale } from '$i18n';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import { RESTAURANT_SLUG } from '$lib/stores/restaurant.svelte';
	import { menuItems as fallbackItems } from '$lib/menu-data';
	import {
		ChefHat,
		Leaf,
		Smartphone,
		Wifi,
		MapPin,
		Clock,
		Phone,
		Mail,
		ArrowRight,
		Star,
		Flame,
		Apple,
		PlayCircle
	} from 'lucide-svelte';

	const restaurant = useQuery(api.restaurants.getBySlug, { slug: RESTAURANT_SLUG });

	const menuItemsQuery = useQuery(
		api.menuItems.listByRestaurant,
		() => (restaurant.data?._id ? { restaurantId: restaurant.data._id, onlyAvailable: true } : 'skip')
	);

	// Use Convex data when available, fall back to static data
	const featuredItems = $derived(
		menuItemsQuery.data
			? menuItemsQuery.data.slice(0, 6)
			: fallbackItems.filter((i) => i.popular).slice(0, 6)
	);

	// Hero card items
	const topItem = $derived(featuredItems[0]);
	const midItem = $derived(featuredItems[1]);
	const smallItem = $derived(featuredItems[2]);

	// Map Convex fields to template expectations
	function getItemEmoji(item: any): string {
		// If Convex item with categoryId, we can't resolve category name easily here
		// Use isVeg as a heuristic, or fall back to category field from static data
		if (item.category) {
			const map: Record<string, string> = { appetizers: '🥟', mains: '🍛', drinks: '☕', desserts: '🍮' };
			return map[item.category] || '🍽️';
		}
		if (item.isVeg) return '🥬';
		return '🍛';
	}

	const features = [
		{
			icon: ChefHat,
			titleKey: 'features.authentic.title',
			descKey: 'features.authentic.desc',
			gradient: 'from-orange-500 to-red-500'
		},
		{
			icon: Leaf,
			titleKey: 'features.fresh.title',
			descKey: 'features.fresh.desc',
			gradient: 'from-green-500 to-emerald-500'
		},
		{
			icon: Smartphone,
			titleKey: 'features.app.title',
			descKey: 'features.app.desc',
			gradient: 'from-blue-500 to-purple-500'
		},
		{
			icon: Wifi,
			titleKey: 'features.wifi.title',
			descKey: 'features.wifi.desc',
			gradient: 'from-cyan-500 to-teal-500'
		}
	];
</script>

<svelte:head>
	<title>{$t('site.name')} — {$t('site.tagline')}</title>
	<meta name="description" content={$t('site.description')} />
	<meta property="og:title" content="{$t('site.name')} — {$t('site.tagline')}" />
	<meta property="og:description" content={$t('site.description')} />
	<meta property="og:type" content="restaurant" />
	<meta property="og:locale" content={$locale === 'ne' ? 'ne_NP' : 'en_US'} />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Restaurant',
		name: 'Mero Restaurant',
		description: 'Authentic Nepali Cuisine in Surkhet',
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Birendranagar',
			addressLocality: 'Surkhet',
			addressCountry: 'NP'
		},
		telephone: '+977-083-520123',
		email: 'hello@merorestaurant.com',
		servesCuisine: 'Nepali',
		openingHoursSpecification: [
			{
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				opens: '07:00',
				closes: '21:00'
			}
		],
		priceRange: '$$'
	})}</script>`}
</svelte:head>

<!-- Hero Section -->
<section class="relative flex min-h-screen items-center overflow-hidden">
	<!-- Background with gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-br from-orange-950 via-red-950 to-amber-950">
		<div
			class="absolute inset-0 opacity-20"
			style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.08%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div
			class="absolute top-20 left-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl"
		></div>
		<div
			class="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-red-500/10 blur-3xl"
		></div>
		<div
			class="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<div class="animate-fade-in">
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
				>
					<span class="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
					<span class="text-sm text-white/80">{$t('hero.badge')}</span>
				</div>

				<h1 class="font-[var(--font-display)] text-5xl leading-tight font-bold text-white sm:text-7xl">
					{$t('hero.title')}
					<br />
					<span
						class="bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent"
					>
						{$t('hero.subtitle')}
					</span>
				</h1>

				<p class="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
					{$t('hero.description')}
				</p>

				<div class="mt-10 flex flex-wrap gap-4">
					<a
						href="/menu"
						class="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30"
					>
						{$t('hero.cta')}
						<ArrowRight
							class="h-4 w-4 transition-transform group-hover:translate-x-1"
						/>
					</a>
					<a
						href="#download"
						class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
					>
						{$t('hero.download')}
					</a>
				</div>

				<div class="mt-12 flex gap-8 border-t border-white/10 pt-8">
					<div>
						<p class="font-[var(--font-display)] text-3xl font-bold text-white">
							{menuItemsQuery.data ? `${menuItemsQuery.data.length}+` : '14+'}
						</p>
						<p class="text-sm text-white/60">{$t('hero.stat.dishes')}</p>
					</div>
					<div>
						<p class="font-[var(--font-display)] text-3xl font-bold text-white">4.8</p>
						<p class="text-sm text-white/60">{$t('hero.stat.rating')}</p>
					</div>
					<div>
						<p class="font-[var(--font-display)] text-3xl font-bold text-white">5+</p>
						<p class="text-sm text-white/60">{$t('hero.stat.years')}</p>
					</div>
				</div>
			</div>

			<!-- Hero visual - floating food cards -->
			<div class="relative hidden lg:block">
				<div class="relative mx-auto h-[500px] w-[400px]">
						<div
						class="animate-slide-up absolute top-8 left-8 z-20 w-72 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md"
					>
						<div class="bg-gradient-to-br from-orange-400/30 to-red-400/30 p-6">
							<span class="text-6xl">🥟</span>
						</div>
						<div class="p-5">
							<p class="font-[var(--font-display)] text-lg font-semibold text-white">
								{topItem?.name ?? 'Chicken Momo'}
							</p>
							<p class="mt-1 text-sm text-white/60">
								{topItem?.description ?? 'Traditional steamed dumplings'}
							</p>
							<div class="mt-3 flex items-center justify-between">
								<span class="text-xl font-bold text-amber-300">Rs. {topItem?.price ?? 250}</span>
								<div class="flex items-center gap-1">
									<Star class="h-4 w-4 fill-amber-400 text-amber-400" />
									<span class="text-sm text-white/70">4.9</span>
								</div>
							</div>
						</div>
					</div>

					<div
						class="absolute top-48 right-0 z-10 w-64 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm"
						style="animation: slide-up 0.8s ease-out 0.2s both"
					>
						<div class="bg-gradient-to-br from-green-400/20 to-emerald-400/20 p-5">
							<span class="text-5xl">🍚</span>
						</div>
						<div class="p-4">
							<p class="font-[var(--font-display)] font-semibold text-white">
								{midItem?.name ?? 'Dal Bhat Tarkari'}
							</p>
							<span class="mt-2 inline-block text-lg font-bold text-amber-300"
								>Rs. {midItem?.price ?? 400}</span
							>
						</div>
					</div>

					<div
						class="absolute bottom-4 left-0 z-30 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md"
						style="animation: scale-in 0.5s ease-out 0.4s both"
					>
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
							<span class="text-2xl">☕</span>
						</div>
						<div>
							<p class="text-sm font-semibold text-white">{smallItem?.name ?? 'Nepali Chiya'}</p>
							<p class="text-xs text-white/60">Rs. {smallItem?.price ?? 60}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="absolute bottom-8 left-1/2 -translate-x-1/2">
		<div class="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/30 p-1">
			<div class="h-2 w-1 animate-bounce rounded-full bg-white/60"></div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="bg-background py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mb-16 text-center">
			<h2 class="font-[var(--font-display)] text-4xl font-bold text-foreground">
				{$t('features.title')}
			</h2>
			<div class="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
			</div>
		</div>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature, i}
				<div
					class="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					style="animation: slide-up 0.6s ease-out {i * 0.1}s both"
				>
					<div
						class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br {feature.gradient} shadow-lg"
					>
						<feature.icon class="h-6 w-6 text-white" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-foreground">
						{$t(feature.titleKey)}
					</h3>
					<p class="text-sm leading-relaxed text-muted-foreground">
						{$t(feature.descKey)}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Menu Preview Section -->
<section class="bg-muted/50 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mb-16 text-center">
			<h2 class="font-[var(--font-display)] text-4xl font-bold text-foreground">
				{$t('menu.title')}
			</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				{$t('menu.subtitle')}
			</p>
			<div class="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
			</div>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each featuredItems as item}
				<div
					class="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div
						class="flex h-44 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20"
					>
						{#if item.imageUrl || item.image}
							<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
						{:else}
							<span class="text-7xl transition-transform duration-300 group-hover:scale-110">
								{getItemEmoji(item)}
							</span>
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
						<p class="mt-1 text-sm text-muted-foreground">
							{$locale === 'ne' ? (item.descriptionNe || item.description || '') : (item.description || '')}
						</p>
						<div class="mt-4 flex items-center justify-between">
							<span class="text-xl font-bold text-primary">Rs. {item.price}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<a
				href="/menu"
				class="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl"
			>
				{$t('menu.viewFull')}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
			</a>
		</div>
	</div>
</section>

<!-- Restaurant Info / Contact Section -->
<section id="contact" class="bg-background py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="mb-16 text-center">
			<h2 class="font-[var(--font-display)] text-4xl font-bold text-foreground">
				{$t('info.title')}
			</h2>
			<div class="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
			</div>
		</div>

		<div class="grid gap-8 lg:grid-cols-3">
			<div class="rounded-2xl border border-border bg-card p-8">
				<div
					class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30"
				>
					<Clock class="h-6 w-6 text-orange-600 dark:text-orange-400" />
				</div>
				<h3 class="mb-3 text-lg font-semibold text-foreground">{$t('info.hours')}</h3>
				<div class="space-y-2 text-sm text-muted-foreground">
					<p>{$t('info.hours.weekday')}</p>
					<p class="text-red-500">{$t('info.hours.saturday')}</p>
				</div>
			</div>

			<div class="rounded-2xl border border-border bg-card p-8">
				<div
					class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30"
				>
					<MapPin class="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
				<h3 class="mb-3 text-lg font-semibold text-foreground">{$t('info.location')}</h3>
				<p class="text-sm text-muted-foreground">
					{restaurant.data?.address || $t('info.address')}
				</p>
				<a
					href="https://maps.google.com/?q=Birendranagar+Surkhet+Nepal"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
				>
					{$t('info.openMaps')}
					<ArrowRight class="h-3 w-3" />
				</a>
			</div>

			<div class="rounded-2xl border border-border bg-card p-8">
				<div
					class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30"
				>
					<Phone class="h-6 w-6 text-green-600 dark:text-green-400" />
				</div>
				<h3 class="mb-3 text-lg font-semibold text-foreground">{$t('nav.contact')}</h3>
				<div class="space-y-2 text-sm text-muted-foreground">
					<a href="tel:+977083520123" class="block hover:text-primary">
						{restaurant.data?.phone || $t('info.phone')}
					</a>
					<a href="mailto:hello@merorestaurant.com" class="block hover:text-primary"
						>{$t('info.email')}</a
					>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Download App Section -->
<section
	id="download"
	class="relative overflow-hidden bg-gradient-to-br from-orange-950 via-red-950 to-amber-950 py-24"
>
	<div
		class="absolute inset-0 opacity-10"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.08%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
		<h2 class="font-[var(--font-display)] text-4xl font-bold text-white sm:text-5xl">
			{$t('download.title')}
		</h2>
		<p class="mt-4 text-lg text-white/70">
			{$t('download.subtitle')}
		</p>

		<div class="mt-10 flex flex-wrap justify-center gap-4">
			<button
				class="inline-flex items-center gap-3 rounded-xl bg-black px-6 py-3.5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
			>
				<Apple class="h-7 w-7" />
				<div class="text-left">
					<p class="text-xs text-white/60">{$t('download.ios.label')}</p>
					<p class="text-base font-semibold">{$t('download.ios.store')}</p>
				</div>
			</button>
			<button
				class="inline-flex items-center gap-3 rounded-xl bg-black px-6 py-3.5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
			>
				<PlayCircle class="h-7 w-7" />
				<div class="text-left">
					<p class="text-xs text-white/60">{$t('download.android.label')}</p>
					<p class="text-base font-semibold">{$t('download.android.store')}</p>
				</div>
			</button>
		</div>
	</div>
</section>
