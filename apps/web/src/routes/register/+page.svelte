<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/state';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import { goto } from '$app/navigation';
	import { ArrowRight, Check, Loader2, Rocket, Building2, LogIn } from 'lucide-svelte';

	let convexClient: ReturnType<typeof useConvexClient> | null = null;
	try { convexClient = useConvexClient(); } catch {}

	const user = $derived(page.data?.user);

	// If user just authenticated, jump to step 2
	const urlStep = $derived(page.url?.searchParams?.get('step'));
	let step = $state(1);
	$effect(() => {
		if (user && urlStep === 'restaurant') step = 2;
		else if (user) step = 2;
	});

	let creating = $state(false);
	let error = $state('');

	// Restaurant info
	let restaurantName = $state('');
	let restaurantNameNe = $state('');
	let address = $state('');
	let city = $state('Surkhet');
	let slug = $state('');

	const autoSlug = $derived(
		restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
	);

	async function handleSubmit() {
		if (!convexClient || !user) {
			error = 'Please sign in first.';
			return;
		}
		creating = true;
		error = '';

		try {
			// Upsert user in Convex with real WorkOS ID
			const userId = await convexClient.mutation(api.auth.loginOrSignup, {
				workosUserId: user.workosUserId,
				email: user.email,
				name: user.name
			});

			// Register the restaurant tenant
			await convexClient.mutation(api.restaurants.register, {
				ownerId: userId as any,
				name: restaurantName,
				nameNe: restaurantNameNe || undefined,
				slug: slug || autoSlug,
				address,
				city,
				phone: '',
				email: user.email || undefined
			});

			step = 3;
		} catch (err: any) {
			error = err?.message || 'Failed to create restaurant. Please try again.';
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('register.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-lg px-5">
		<!-- Steps indicator -->
		<div class="mb-10 flex items-center justify-center gap-3">
			{#each [1, 2, 3] as s}
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold {s <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}">
						{#if s < step}<Check class="h-4 w-4" />{:else}{s}{/if}
					</div>
					{#if s < 3}
						<div class="h-px w-10 {s < step ? 'bg-primary' : 'bg-border'}"></div>
					{/if}
				</div>
			{/each}
		</div>

		{#if step === 1}
			<!-- Step 1: Sign in with WorkOS -->
			<div class="text-center">
				<h1 class="text-2xl font-bold text-foreground">{$t('register.step1')}</h1>
				<p class="mt-2 text-sm text-muted-foreground">{$t('register.subtitle')}</p>
			</div>
			<div class="mt-8">
				<a
					href="/auth/login"
					class="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg"
				>
					<LogIn class="h-5 w-5" />
					Sign up with WorkOS
				</a>
				<p class="mt-4 text-center text-[12px] text-muted-foreground">
					Already have an account?
					<a href="/auth/login" class="font-medium text-primary hover:underline">{$t('nav.login')}</a>
				</p>
			</div>

		{:else if step === 2}
			<!-- Step 2: Restaurant info -->
			<div class="text-center">
				<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
					<Building2 class="h-6 w-6 text-primary" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">{$t('register.step2')}</h1>
				{#if user}
					<p class="mt-1 text-[13px] text-muted-foreground">Signed in as {user.email}</p>
				{/if}
			</div>
			<div class="mt-8 space-y-4">
				<div>
					<label for="rest-name" class="mb-1.5 block text-[13px] font-medium text-foreground">{$t('register.restaurantName')}</label>
					<input id="rest-name" bind:value={restaurantName} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label for="rest-name-ne" class="mb-1.5 block text-[13px] font-medium text-foreground">{$t('register.restaurantNameNe')}</label>
					<input id="rest-name-ne" bind:value={restaurantNameNe} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="rest-city" class="mb-1.5 block text-[13px] font-medium text-foreground">City</label>
						<input id="rest-city" bind:value={city} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
					</div>
					<div>
						<label for="rest-slug" class="mb-1.5 block text-[13px] font-medium text-foreground">{$t('register.slug')}</label>
						<input id="rest-slug" bind:value={slug} type="text" placeholder={autoSlug} class="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
					</div>
				</div>
				<div>
					<label for="rest-address" class="mb-1.5 block text-[13px] font-medium text-foreground">{$t('register.address')}</label>
					<input id="rest-address" bind:value={address} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>

				{#if error}
					<div class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">{error}</div>
				{/if}

				<button
					onclick={handleSubmit}
					disabled={!restaurantName || !address || !city || creating}
					class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
				>
					{#if creating}
						<Loader2 class="h-4 w-4 animate-spin" />
						{$t('register.creating')}
					{:else}
						{$t('register.submit')}
					{/if}
				</button>
			</div>

		{:else}
			<!-- Step 3: Success -->
			<div class="text-center">
				<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950/30">
					<Rocket class="h-8 w-8 text-green-600 dark:text-green-400" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">{$t('register.success.title')}</h1>
				<p class="mt-2 text-muted-foreground">{$t('register.success.desc')}</p>
				<a href="/dashboard" class="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
					{$t('register.success.cta')}
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
		{/if}
	</div>
</section>
