<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$i18n';
	import {
		Clock,
		CheckCircle2,
		ChefHat,
		Bell,
		UtensilsCrossed,
		ArrowLeft,
		PartyPopper
	} from 'lucide-svelte';

	// TODO: Replace with real Convex query when ready
	// import { useQuery } from 'convex-svelte';
	// import { api } from '$lib/convex/_generated/api';
	// const order = useQuery(api.orders.getByNumber, () => ({ orderNumber: page.params.id }));

	const orderId = $derived(page.params.id);

	// Stub order data — will be replaced by Convex subscription
	const orderStatus = $state<'placed' | 'confirmed' | 'preparing' | 'ready' | 'served'>('confirmed');

	const steps = [
		{
			id: 'placed' as const,
			label: 'Order Placed',
			labelNe: 'अर्डर गरियो',
			icon: CheckCircle2,
			time: new Date(Date.now() - 5 * 60_000)
		},
		{
			id: 'confirmed' as const,
			label: 'Confirmed',
			labelNe: 'पुष्टि भयो',
			icon: Bell,
			time: new Date(Date.now() - 3 * 60_000)
		},
		{
			id: 'preparing' as const,
			label: 'Preparing',
			labelNe: 'तयार हुँदैछ',
			icon: ChefHat,
			time: null
		},
		{
			id: 'ready' as const,
			label: 'Ready',
			labelNe: 'तयार छ',
			icon: UtensilsCrossed,
			time: null
		},
		{
			id: 'served' as const,
			label: 'Served',
			labelNe: 'सर्भ भयो',
			icon: PartyPopper,
			time: null
		}
	];

	const stepOrder = ['placed', 'confirmed', 'preparing', 'ready', 'served'] as const;

	function isStepComplete(stepId: string): boolean {
		return stepOrder.indexOf(stepId as typeof stepOrder[number]) <= stepOrder.indexOf(orderStatus);
	}

	function isStepActive(stepId: string): boolean {
		return stepId === orderStatus;
	}

	function formatTime(date: Date | null): string {
		if (!date) return '';
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Order {orderId} — {$t('site.name')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		<a
			href="/menu"
			class="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
		>
			<ArrowLeft class="h-4 w-4" />
			Order More
		</a>
		<h1 class="font-[var(--font-display)] text-3xl font-bold text-white">
			Order #{orderId}
		</h1>
		<p class="mt-2 text-white/60">Track your order in real-time</p>
	</div>
</section>

<section class="bg-background py-12">
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		<!-- Status Stepper -->
		<div class="rounded-2xl border border-border bg-card p-8">
			<div class="relative">
				{#each steps as step, i}
					{@const complete = isStepComplete(step.id)}
					{@const active = isStepActive(step.id)}

					<div class="relative flex gap-6 {i < steps.length - 1 ? 'pb-10' : ''}">
						<!-- Vertical connector line -->
						{#if i < steps.length - 1}
							<div
								class="absolute top-12 left-6 h-[calc(100%-2rem)] w-0.5 -translate-x-1/2 {complete && !active
									? 'bg-gradient-to-b from-orange-500 to-orange-400'
									: 'bg-border'}"
							></div>
						{/if}

						<!-- Step circle -->
						<div class="relative z-10 shrink-0">
							{#if active}
								<!-- Active: pulsing ring -->
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
								<!-- Complete: solid fill -->
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-md"
								>
									<step.icon class="h-5 w-5 text-white" />
								</div>
							{:else}
								<!-- Pending: outlined -->
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card"
								>
									<step.icon class="h-5 w-5 text-muted-foreground/50" />
								</div>
							{/if}
						</div>

						<!-- Step content -->
						<div class="flex-1 pt-2">
							<div class="flex items-center gap-3">
								<h3
									class="font-semibold {complete || active
										? 'text-foreground'
										: 'text-muted-foreground/60'}"
								>
									{step.label}
								</h3>
								{#if active}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
									>
										<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500"></span>
										In Progress
									</span>
								{/if}
							</div>
							{#if step.time && complete}
								<p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
									<Clock class="h-3.5 w-3.5" />
									{formatTime(step.time)}
								</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Estimated Time -->
		{#if orderStatus !== 'served'}
			<div
				class="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-900/50 dark:bg-amber-950/20"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
					<Clock class="h-5 w-5 text-amber-600 dark:text-amber-400" />
				</div>
				<div>
					<p class="font-medium text-amber-900 dark:text-amber-200">
						Estimated time: ~15-25 minutes
					</p>
					<p class="text-sm text-amber-700 dark:text-amber-400/70">
						We'll notify you when your order is ready
					</p>
				</div>
			</div>
		{:else}
			<div
				class="mt-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900/50 dark:bg-green-950/20"
			>
				<PartyPopper class="mx-auto mb-3 h-10 w-10 text-green-500" />
				<h3 class="text-lg font-semibold text-green-800 dark:text-green-300">
					Enjoy your meal!
				</h3>
				<p class="mt-1 text-sm text-green-600 dark:text-green-400/70">
					Thank you for dining at Mero Restaurant
				</p>
			</div>
		{/if}

		<!-- Order Details -->
		<div class="mt-6 rounded-2xl border border-border bg-card p-6">
			<h2 class="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
				Order Details
			</h2>
			<p class="text-sm text-muted-foreground">
				Order details will appear here once connected to the backend.
			</p>
			<p class="mt-2 text-xs text-muted-foreground/60">
				Real-time updates via Convex — coming soon
			</p>
		</div>

		<!-- Actions -->
		<div class="mt-6 flex flex-col gap-3 sm:flex-row">
			<a
				href="/menu"
				class="flex-1 rounded-xl border border-border bg-card px-6 py-3.5 text-center font-medium text-foreground transition-colors hover:bg-secondary"
			>
				Order More Items
			</a>
			<a
				href="/"
				class="flex-1 rounded-xl bg-primary px-6 py-3.5 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Back to Home
			</a>
		</div>
	</div>
</section>
