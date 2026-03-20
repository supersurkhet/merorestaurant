<script lang="ts">
	import { t } from '$i18n';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import { RESTAURANT_SLUG } from '$lib/stores/restaurant.svelte';
	import { Wifi, Check, Loader2 } from 'lucide-svelte';

	const restaurant = useQuery(api.restaurants.getBySlug, { slug: RESTAURANT_SLUG });

	const wifiConfig = useQuery(
		api.wifiConfigs.getActiveByRestaurant,
		() => (restaurant.data?._id ? { restaurantId: restaurant.data._id } : 'skip')
	);

	let status = $state<'idle' | 'connecting' | 'connected'>('idle');

	// Use Convex data or fallback
	const ssid = $derived(wifiConfig.data?.ssid ?? 'MeroRestaurant-Guest');
	const qrString = $derived(
		wifiConfig.data?.qrString ?? 'WIFI:T:WPA;S:MeroRestaurant-Guest;P:namaste2024;;'
	);

	function connect() {
		status = 'connecting';
		try {
			window.location.href = qrString;
		} catch {
			// fallback
		}
		setTimeout(() => {
			status = 'connected';
		}, 2000);
	}
</script>

<svelte:head>
	<title>{$t('wifi.title')} — {$t('site.name')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="flex min-h-screen items-center bg-gradient-to-b from-orange-950 to-background">
	<div class="mx-auto w-full max-w-md px-4 py-32 text-center">
		<div class="rounded-3xl border border-border bg-card p-8 shadow-2xl">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
				{#if status === 'connected'}
					<Check class="h-10 w-10 text-green-500" />
				{:else if status === 'connecting'}
					<Wifi class="h-10 w-10 animate-pulse text-primary" />
				{:else if wifiConfig.isLoading}
					<Loader2 class="h-10 w-10 animate-spin text-primary" />
				{:else}
					<Wifi class="h-10 w-10 text-primary" />
				{/if}
			</div>

			<h1 class="font-[var(--font-display)] text-2xl font-bold text-foreground">
				{$t('wifi.title')}
			</h1>
			<p class="mt-2 text-muted-foreground">
				{$t('wifi.subtitle')}
			</p>

			<div class="mt-8 rounded-xl bg-muted p-4">
				<p class="text-sm text-muted-foreground">{$t('wifi.network')}</p>
				<p class="mt-1 text-lg font-semibold text-foreground">{ssid}</p>
			</div>

			{#if status === 'connected'}
				<div class="mt-8 rounded-xl bg-green-50 p-6 dark:bg-green-950/30">
					<Check class="mx-auto mb-2 h-8 w-8 text-green-500" />
					<p class="font-semibold text-green-700 dark:text-green-400">
						{$t('wifi.connected')}
					</p>
					<p class="mt-2 text-sm text-green-600 dark:text-green-500">
						{$t('wifi.enjoy')}
					</p>
				</div>
			{:else}
				<button
					onclick={connect}
					disabled={status === 'connecting'}
					class="mt-8 w-full rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-60"
				>
					{#if status === 'connecting'}
						{$t('wifi.connecting')}
					{:else}
						{$t('wifi.connect')}
					{/if}
				</button>
			{/if}

			<div class="mt-8 border-t border-border pt-6">
				<span class="text-3xl">🍛</span>
				<p class="mt-2 text-sm font-medium text-foreground">{$t('site.name')}</p>
				<p class="text-xs text-muted-foreground">{$t('site.tagline')}</p>
			</div>
		</div>
	</div>
</section>
