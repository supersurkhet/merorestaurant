<script lang="ts">
	import { page } from '$app/state';
	import { t, locale } from '$i18n';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import {
		Clock,
		CheckCircle2,
		ChefHat,
		Bell,
		UtensilsCrossed,
		ArrowLeft,
		PartyPopper,
		Loader2,
		AlertCircle,
		CreditCard,
		Receipt
	} from 'lucide-svelte';

	const orderNumber = $derived(page.params.id);

	const orderQuery = useQuery(
		api.orders.getByOrderNumber,
		() => ({ orderNumber: orderNumber })
	);

	const order = $derived(orderQuery.data);

	// Map Convex status to stepper
	// Root schema uses: placed, confirmed, preparing, ready, served, cancelled
	const statusMap = {
		placed: 0,
		confirmed: 1,
		preparing: 2,
		ready: 3,
		served: 4,
		cancelled: -1
	} as const;

	const steps = [
		{ id: 'placed', key: 'order.status.pending', icon: CheckCircle2 },
		{ id: 'confirmed', key: 'order.status.confirmed', icon: Bell },
		{ id: 'preparing', key: 'order.status.preparing', icon: ChefHat },
		{ id: 'ready', key: 'order.status.ready', icon: UtensilsCrossed },
		{ id: 'served', key: 'order.status.served', icon: PartyPopper }
	];

	const currentStepIndex = $derived(
		order ? (statusMap[order.status as keyof typeof statusMap] ?? 0) : 0
	);

	function getStepTime(stepId: string): number | null {
		if (!order) return null;
		const map: Record<string, string> = {
			placed: 'placedAt',
			confirmed: 'confirmedAt',
			preparing: 'preparedAt',
			ready: 'readyAt',
			served: 'servedAt'
		};
		const field = map[stepId];
		if (!field) return null;
		return (order as any)[field] ?? null;
	}

	function formatTime(ts: number | null): string {
		if (!ts) return '';
		return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	const isCancelled = $derived(order?.status === 'cancelled');
	const isComplete = $derived(order?.status === 'served');
</script>

<svelte:head>
	<title>Order {orderNumber} — {$t('site.name')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		<a
			href="/menu"
			class="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
		>
			<ArrowLeft class="h-4 w-4" />
			{$t('order.orderMore')}
		</a>
		<h1 class="font-[var(--font-display)] text-3xl font-bold text-white">
			Order #{orderNumber}
		</h1>
		<p class="mt-2 text-white/60">
			{#if order}
				{order.customerName ? `${order.customerName} — ` : ''}{$t('order.realtime')}
			{:else}
				{$t('order.trackTitle')}
			{/if}
		</p>
	</div>
</section>

<section class="bg-background py-12">
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		{#if orderQuery.isLoading && !order}
			<div class="flex justify-center py-20">
				<div class="flex flex-col items-center gap-3">
					<Loader2 class="h-8 w-8 animate-spin text-primary" />
					<p class="text-sm text-muted-foreground">{$t('order.loading')}</p>
				</div>
			</div>
		{:else if !order && !orderQuery.isLoading}
			<div class="rounded-2xl border border-border bg-card py-16 text-center">
				<AlertCircle class="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
				<h2 class="text-lg font-semibold text-foreground">{$t('order.notFound')}</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					{$t('order.notFoundDesc')}
				</p>
				<a
					href="/menu"
					class="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
				>
					{$t('order.browseMenu')}
				</a>
			</div>
		{:else if isCancelled}
			<div class="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/20">
				<AlertCircle class="mx-auto mb-3 h-10 w-10 text-red-500" />
				<h3 class="text-lg font-semibold text-red-800 dark:text-red-300">
					{$t('order.cancelled')}
				</h3>
				<p class="mt-1 text-sm text-red-600 dark:text-red-400/70">
					{$t('order.cancelledDesc')}
					{#if order?.cancelledAt}
						at {formatTime(order.cancelledAt)}
					{/if}
				</p>
			</div>
		{:else}
			<!-- Status Stepper -->
			<div class="rounded-2xl border border-border bg-card p-8">
				<div class="relative">
					{#each steps as step, i}
						{@const complete = i <= currentStepIndex}
						{@const active = i === currentStepIndex}
						{@const stepTime = getStepTime(step.id)}

						<div class="relative flex gap-6 {i < steps.length - 1 ? 'pb-10' : ''}">
							{#if i < steps.length - 1}
								<div
									class="absolute top-12 left-6 h-[calc(100%-2rem)] w-0.5 -translate-x-1/2 {complete && !active
										? 'bg-gradient-to-b from-orange-500 to-orange-400'
										: 'bg-border'}"
								></div>
							{/if}

							<div class="relative z-10 shrink-0">
								{#if active}
									<div class="relative">
										<div
											class="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-orange-500/20"
										></div>
										<div
											class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
										>
											<step.icon class="h-5 w-5 text-white" />
										</div>
									</div>
								{:else if complete}
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-md"
									>
										<step.icon class="h-5 w-5 text-white" />
									</div>
								{:else}
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card"
									>
										<step.icon class="h-5 w-5 text-muted-foreground/50" />
									</div>
								{/if}
							</div>

							<div class="flex-1 pt-2">
								<div class="flex items-center gap-3">
									<h3
										class="font-semibold {complete || active
											? 'text-foreground'
											: 'text-muted-foreground/60'}"
									>
										{$t(step.key)}
									</h3>
									{#if active && !isComplete}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
										>
											<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500"></span>
											{$t('order.inProgress')}
										</span>
									{/if}
								</div>
								{#if stepTime && complete}
									<p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
										<Clock class="h-3.5 w-3.5" />
										{formatTime(stepTime)}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if !isComplete}
				<div
					class="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-900/50 dark:bg-amber-950/20"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
						<Clock class="h-5 w-5 text-amber-600 dark:text-amber-400" />
					</div>
					<div>
						<p class="font-medium text-amber-900 dark:text-amber-200">
							{$t('order.estimatedTime')}
						</p>
						<p class="text-sm text-amber-700 dark:text-amber-400/70">
							{$t('order.estimatedTimeDesc')}
						</p>
					</div>
				</div>
			{:else}
				<div
					class="mt-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900/50 dark:bg-green-950/20"
				>
					<PartyPopper class="mx-auto mb-3 h-10 w-10 text-green-500" />
					<h3 class="text-lg font-semibold text-green-800 dark:text-green-300">
						{$t('order.enjoyMeal')}
					</h3>
					<p class="mt-1 text-sm text-green-600 dark:text-green-400/70">
						{$t('order.thankYou')}
					</p>
				</div>
			{/if}
		{/if}

		<!-- Order Details — shows when order data is loaded -->
		{#if order && order.items}
			<div class="mt-6 rounded-2xl border border-border bg-card">
				<div class="border-b border-border p-6">
					<h2 class="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
						<Receipt class="h-4 w-4" />
						{$t('order.details')}
					</h2>
				</div>
				<div class="divide-y divide-border">
					{#each order.items as item}
						<div class="flex items-center justify-between px-6 py-4">
							<div class="flex items-center gap-3">
								<span class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
									{item.quantity}x
								</span>
								<span class="font-medium text-foreground">{item.name}</span>
							</div>
							<span class="text-sm font-medium text-foreground">Rs. {item.price * item.quantity}</span>
						</div>
					{/each}
				</div>
				<div class="border-t border-border p-6">
					<div class="space-y-2 text-sm">
						<div class="flex justify-between text-muted-foreground">
							<span>{$t('order.subtotal')}</span>
							<span>Rs. {order.subtotal}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>{$t('order.vat')}</span>
							<span>Rs. {order.tax}</span>
						</div>
						<div class="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
							<span>{$t('order.total')}</span>
							<span class="text-primary">Rs. {order.total}</span>
						</div>
					</div>

					{#if order.status !== 'served' && order.status !== 'cancelled'}
						<a
							href="/payment/{order._id}"
							class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
						>
							<CreditCard class="h-4 w-4" />
							{$t('payment.payNow')} — Rs. {order.total}
						</a>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="mt-6 flex flex-col gap-3 sm:flex-row">
			<a
				href="/menu"
				class="flex-1 rounded-xl border border-border bg-card px-6 py-3.5 text-center font-medium text-foreground transition-colors hover:bg-secondary"
			>
				{$t('order.moreItems')}
			</a>
			<a
				href="/"
				class="flex-1 rounded-xl bg-primary px-6 py-3.5 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				{$t('order.backToHome')}
			</a>
		</div>
	</div>
</section>
