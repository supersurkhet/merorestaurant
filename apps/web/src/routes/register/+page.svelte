<script lang="ts">
	import { t } from '$i18n';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import { ArrowLeft, ArrowRight, Check, Loader2, Rocket } from 'lucide-svelte';

	let convexClient: ReturnType<typeof useConvexClient> | null = null;
	try { convexClient = useConvexClient(); } catch {}

	let step = $state(1);
	let creating = $state(false);
	let error = $state('');
	let done = $state(false);

	// Step 1 fields
	let name = $state('');
	let email = $state('');
	let phone = $state('');

	// Step 2 fields
	let restaurantName = $state('');
	let restaurantNameNe = $state('');
	let address = $state('');
	let slug = $state('');

	const autoSlug = $derived(
		restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
	);

	async function handleSubmit() {
		if (!convexClient) {
			error = 'Unable to connect. Please try again.';
			return;
		}
		creating = true;
		error = '';

		try {
			await convexClient.mutation(api.restaurants.create, {
				name: restaurantName,
				nameNe: restaurantNameNe || restaurantName,
				slug: slug || autoSlug,
				address,
				phone,
				email: email || undefined,
				openingTime: '07:00',
				closingTime: '22:00',
				currency: 'NPR'
			});
			done = true;
			step = 3;
		} catch (err: any) {
			error = err?.message || 'Failed to create restaurant.';
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
						<div class="h-px w-12 {s < step ? 'bg-primary' : 'bg-border'}"></div>
					{/if}
				</div>
			{/each}
		</div>

		{#if step === 1}
			<div class="text-center">
				<h1 class="text-2xl font-bold text-foreground">{$t('register.step1')}</h1>
				<p class="mt-2 text-sm text-muted-foreground">{$t('register.subtitle')}</p>
			</div>
			<div class="mt-8 space-y-4">
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.name')}</label>
					<input bind:value={name} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.email')}</label>
					<input bind:value={email} type="email" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.phone')}</label>
					<input bind:value={phone} type="tel" placeholder="+977-" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<button
					onclick={() => { if (name && email) step = 2; }}
					disabled={!name || !email}
					class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
				>
					{$t('register.next')}
					<ArrowRight class="h-4 w-4" />
				</button>
			</div>
		{:else if step === 2}
			<div class="text-center">
				<h1 class="text-2xl font-bold text-foreground">{$t('register.step2')}</h1>
			</div>
			<div class="mt-8 space-y-4">
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.restaurantName')}</label>
					<input bind:value={restaurantName} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.restaurantNameNe')}</label>
					<input bind:value={restaurantNameNe} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.address')}</label>
					<input bind:value={address} type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('register.slug')}</label>
					<input bind:value={slug} type="text" placeholder={autoSlug} class="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
					<p class="mt-1 text-[12px] text-muted-foreground">{$t('register.slugHelp')}</p>
				</div>

				{#if error}
					<div class="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
				{/if}

				<div class="flex gap-3">
					<button onclick={() => (step = 1)} class="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-secondary">
						{$t('register.back')}
					</button>
					<button
						onclick={handleSubmit}
						disabled={!restaurantName || !address || creating}
						class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
					>
						{#if creating}
							<Loader2 class="h-4 w-4 animate-spin" />
							{$t('register.creating')}
						{:else}
							{$t('register.submit')}
						{/if}
					</button>
				</div>
			</div>
		{:else}
			<div class="text-center">
				<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
					<Rocket class="h-8 w-8 text-green-600 dark:text-green-400" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">{$t('register.success.title')}</h1>
				<p class="mt-2 text-muted-foreground">{$t('register.success.desc')}</p>
				<a href="/" class="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
					{$t('register.success.cta')}
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
		{/if}
	</div>
</section>
