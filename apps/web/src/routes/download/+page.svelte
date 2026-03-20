<script lang="ts">
	import { t } from '$i18n';
	import { onMount } from 'svelte';
	import { Download, Monitor, Smartphone, Apple, ExternalLink } from 'lucide-svelte';

	const GITHUB_RELEASES = 'https://github.com/supersurkhet/merorestaurant/releases/latest';

	type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';
	type Role = 'owner' | 'customer';

	let detectedPlatform = $state<Platform>('unknown');
	let role = $state<Role>('owner');

	onMount(() => {
		const ua = navigator.userAgent.toLowerCase();
		if (/android/.test(ua)) detectedPlatform = 'android';
		else if (/iphone|ipad|ipod/.test(ua)) detectedPlatform = 'ios';
		else if (/macintosh|mac os/.test(ua)) detectedPlatform = 'macos';
		else if (/windows/.test(ua)) detectedPlatform = 'windows';
		else if (/linux/.test(ua)) detectedPlatform = 'linux';

		// Auto-set role based on platform
		if (detectedPlatform === 'android' || detectedPlatform === 'ios') {
			role = 'customer';
		}
	});

	const ownerPlatforms = [
		{ id: 'macos' as Platform, label: 'macOS', ext: '.dmg', icon: '🍎' },
		{ id: 'windows' as Platform, label: 'Windows', ext: '.msi', icon: '🪟' },
		{ id: 'linux' as Platform, label: 'Linux', ext: '.AppImage', icon: '🐧' }
	];

	const customerPlatforms = [
		{ id: 'android' as Platform, label: 'Android APK', ext: '.apk', icon: '🤖' },
		{ id: 'ios' as Platform, label: 'iOS (Coming Soon)', ext: null, icon: '🍏' }
	];

	const currentPlatforms = $derived(role === 'owner' ? ownerPlatforms : customerPlatforms);
	const primaryPlatform = $derived(currentPlatforms.find(p => p.id === detectedPlatform) || currentPlatforms[0]);
	const otherPlatforms = $derived(currentPlatforms.filter(p => p.id !== primaryPlatform?.id));
</script>

<svelte:head>
	<title>{$t('download.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-3xl px-5">
		<div class="mb-12 text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('download.title')}</h1>
			<p class="mt-3 text-muted-foreground">{$t('download.subtitle')}</p>
		</div>

		<!-- Role Toggle -->
		<div class="mx-auto mb-10 flex max-w-xs overflow-hidden rounded-xl border border-border bg-card p-1">
			<button
				class="flex-1 rounded-lg py-2.5 text-center text-[13px] font-medium transition-all {role === 'owner' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (role = 'owner')}
			>
				Restaurant Owner
			</button>
			<button
				class="flex-1 rounded-lg py-2.5 text-center text-[13px] font-medium transition-all {role === 'customer' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (role = 'customer')}
			>
				Customer
			</button>
		</div>

		<!-- Primary Download (detected platform) -->
		{#if primaryPlatform}
			<div class="rounded-2xl border border-border bg-card p-8 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
					{#if role === 'owner'}
						<Monitor class="h-8 w-8 text-primary" />
					{:else}
						<Smartphone class="h-8 w-8 text-primary" />
					{/if}
				</div>
				<h2 class="text-xl font-bold text-foreground">
					{role === 'owner' ? $t('download.admin.title') : $t('download.customer.title')}
				</h2>
				<p class="mt-2 text-[14px] text-muted-foreground">
					{role === 'owner' ? $t('download.admin.desc') : $t('download.customer.desc')}
				</p>
				<p class="mt-1 text-[12px] text-muted-foreground/60">
					Detected: {primaryPlatform.label}
				</p>

				{#if primaryPlatform.ext}
					<a
						href={GITHUB_RELEASES}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl"
					>
						<Download class="h-5 w-5" />
						Download for {primaryPlatform.label}
					</a>
				{:else}
					<div class="mt-6 inline-flex items-center gap-2.5 rounded-xl border border-border px-8 py-3.5 text-[15px] font-medium text-muted-foreground">
						Coming Soon
					</div>
				{/if}
			</div>
		{/if}

		<!-- Other Platforms -->
		{#if otherPlatforms.length > 0}
			<div class="mt-6 grid gap-3 {otherPlatforms.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-' + otherPlatforms.length}">
				{#each otherPlatforms as platform}
					<a
						href={platform.ext ? GITHUB_RELEASES : '#'}
						target={platform.ext ? '_blank' : undefined}
						rel={platform.ext ? 'noopener noreferrer' : undefined}
						class="flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm font-medium transition-colors {platform.ext ? 'text-foreground hover:border-primary/20 hover:bg-secondary' : 'text-muted-foreground/50 cursor-not-allowed'}"
					>
						<span class="text-lg">{platform.icon}</span>
						{platform.label}
						{#if platform.ext}
							<ExternalLink class="h-3.5 w-3.5 text-muted-foreground" />
						{/if}
					</a>
				{/each}
			</div>
		{/if}

		<p class="mt-6 text-center text-[12px] text-muted-foreground">
			{$t('download.admin.note')} ·
			<a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
				GitHub Releases
			</a>
		</p>
	</div>
</section>
