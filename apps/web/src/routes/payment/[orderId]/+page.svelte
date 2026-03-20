<script lang="ts">
	import { page } from '$app/state';
	import { t, locale } from '$i18n';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import { RESTAURANT_SLUG } from '$lib/stores/restaurant.svelte';
	import {
		CreditCard,
		Banknote,
		Smartphone,
		ArrowLeft,
		Check,
		Loader2,
		AlertCircle,
		Receipt
	} from 'lucide-svelte';

	const orderId = $derived(page.params.orderId);

	const restaurant = useQuery(api.restaurants.getBySlug, { slug: RESTAURANT_SLUG });

	let convexClient: ReturnType<typeof useConvexClient> | null = null;
	try {
		convexClient = useConvexClient();
	} catch {
		// Convex not initialized
	}

	type PaymentMethod = 'khalti' | 'esewa' | 'fonepay' | 'cash';

	interface PaymentOption {
		id: PaymentMethod;
		nameKey: string;
		descKey: string;
		icon: typeof CreditCard;
		color: string;
		bgColor: string;
	}

	const paymentOptions: PaymentOption[] = [
		{
			id: 'khalti',
			nameKey: 'payment.khalti',
			descKey: 'payment.khaltiDesc',
			icon: Smartphone,
			color: 'text-purple-600 dark:text-purple-400',
			bgColor: 'bg-purple-100 dark:bg-purple-900/30'
		},
		{
			id: 'esewa',
			nameKey: 'payment.esewa',
			descKey: 'payment.esewaDesc',
			icon: Smartphone,
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-100 dark:bg-green-900/30'
		},
		{
			id: 'fonepay',
			nameKey: 'payment.fonepay',
			descKey: 'payment.fonepayDesc',
			icon: CreditCard,
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'bg-red-100 dark:bg-red-900/30'
		},
		{
			id: 'cash',
			nameKey: 'payment.cash',
			descKey: 'payment.cashDesc',
			icon: Banknote,
			color: 'text-amber-600 dark:text-amber-400',
			bgColor: 'bg-amber-100 dark:bg-amber-900/30'
		}
	];

	let selectedMethod = $state<PaymentMethod | null>(null);
	let processing = $state(false);
	let success = $state(false);
	let error = $state('');

	async function handlePayment() {
		if (!selectedMethod || !convexClient || !restaurant.data?._id) return;
		processing = true;
		error = '';

		try {
			// Query order to get total for payment amount
			const order = await convexClient.query(api.orders.get, { id: orderId as any });
			if (!order) throw new Error('Order not found');

			// Create payment record in Convex
			const paymentId = await convexClient.mutation(api.payments.createPayment, {
				restaurantId: restaurant.data._id,
				orderId: orderId as any,
				method: selectedMethod,
				amount: order.total
			});

			if (selectedMethod === 'cash') {
				// Cash payment — mark as completed immediately
				await convexClient.mutation(api.payments.updateStatus, {
					id: paymentId,
					status: 'completed'
				});
				success = true;
			} else {
				// For digital payments (Khalti, eSewa, Fonepay):
				// In production, redirect to the payment gateway using @nabwin/paisa
				// For now, simulate a successful payment
				await new Promise((r) => setTimeout(r, 2000));
				await convexClient.mutation(api.payments.updateStatus, {
					id: paymentId,
					status: 'completed',
					transactionId: `${selectedMethod.toUpperCase()}-${Date.now()}`
				});
				success = true;
			}
		} catch (err: any) {
			error = err?.message || 'Payment failed. Please try again.';
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Payment — {$t('site.name')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-2xl px-4 sm:px-6">
		<a
			href="/order/{orderId}"
			class="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
		>
			<ArrowLeft class="h-4 w-4" />
			{$t('payment.backToOrder')}
		</a>
		<h1 class="font-[var(--font-display)] text-3xl font-bold text-white">
			{$t('payment.title')}
		</h1>
	</div>
</section>

<section class="bg-background py-12">
	<div class="mx-auto max-w-2xl px-4 sm:px-6">
		{#if success}
			<!-- Payment Success -->
			<div class="rounded-2xl border border-green-200 bg-green-50 px-8 py-14 text-center dark:border-green-900/50 dark:bg-green-950/20">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
					<Check class="h-8 w-8 text-green-500" />
				</div>
				<h2 class="text-2xl font-bold text-green-800 dark:text-green-300">
					{$t('payment.success')}
				</h2>
				<p class="mt-2 text-green-600 dark:text-green-400/70">
					{$t('payment.successDesc')}
				</p>
				<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<a
						href="/order/{orderId}"
						class="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
					>
						{$t('payment.viewOrder')}
					</a>
					<a
						href="/"
						class="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
					>
						{$t('order.backToHome')}
					</a>
				</div>
			</div>
		{:else}
			<!-- Payment Method Selection -->
			<div class="rounded-2xl border border-border bg-card">
				<div class="border-b border-border p-6">
					<h2 class="flex items-center gap-2 text-lg font-semibold text-foreground">
						<Receipt class="h-5 w-5 text-primary" />
						{$t('payment.chooseMethod')}
					</h2>
				</div>

				<div class="space-y-3 p-6">
					{#each paymentOptions as option}
						<button
							class="flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all {selectedMethod === option.id
								? 'border-primary bg-primary/5 shadow-md'
								: 'border-border hover:border-primary/30 hover:bg-secondary/50'}"
							onclick={() => (selectedMethod = option.id)}
						>
							<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl {option.bgColor}">
								<option.icon class="h-6 w-6 {option.color}" />
							</div>
							<div class="flex-1">
								<p class="font-semibold text-foreground">{$t(option.nameKey)}</p>
								<p class="text-sm text-muted-foreground">{$t(option.descKey)}</p>
							</div>
							{#if selectedMethod === option.id}
								<div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
									<Check class="h-3.5 w-3.5 text-primary-foreground" />
								</div>
							{/if}
						</button>
					{/each}
				</div>

				{#if error}
					<div class="mx-6 mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
						<AlertCircle class="h-4 w-4 shrink-0" />
						{error}
					</div>
				{/if}

				<div class="border-t border-border p-6">
					<button
						onclick={handlePayment}
						disabled={!selectedMethod || processing}
						class="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
					>
						{#if processing}
							<span class="inline-flex items-center gap-2">
								<Loader2 class="h-4 w-4 animate-spin" />
								{$t('payment.processing')}
							</span>
						{:else if selectedMethod}
							{$t('payment.payWith')} {$t(paymentOptions.find((o) => o.id === selectedMethod)?.nameKey ?? '')}
						{:else}
							{$t('payment.selectMethod')}
						{/if}
					</button>
				</div>
			</div>
		{/if}
	</div>
</section>
