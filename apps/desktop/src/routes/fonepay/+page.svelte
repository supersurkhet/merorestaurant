<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import QrCodeSvg from '$lib/components/QrCode.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { getRestaurant } from '$lib/stores/restaurant.svelte';
	import { formatCurrency, timeAgo } from '$lib/utils';
	import { QrCode, Banknote, History, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();
	const restaurant = getRestaurant();

	let amount = $state(0);
	let merchantId = $state('MR-SURKHET-001');
	let showQr = $state(false);
	let paymentReceived = $state(false);
	let creating = $state(false);
	let currentPaymentId = $state<string | null>(null);

	// Generate Fonepay QR data string
	const fonepayQrData = $derived(
		showQr
			? JSON.stringify({
					merchantId,
					amount,
					restaurantId: restaurant.id,
					currency: 'NPR',
					timestamp: Date.now()
				})
			: ''
	);

	// Real payments from Convex
	const fonepayPayments = $derived(
		data.payments
			.filter((p: Record<string, unknown>) => p.method === 'fonepay')
			.slice(0, 10)
	);

	const todayFonepayTotal = $derived(
		fonepayPayments
			.filter((p: Record<string, unknown>) => p.status === 'completed')
			.reduce((sum: number, p: Record<string, unknown>) => sum + (p.amount as number), 0)
	);

	// Watch for payment completion
	$effect(() => {
		if (currentPaymentId && showQr) {
			const payment = data.payments.find((p: Record<string, unknown>) => p._id === currentPaymentId);
			if (payment && payment.status === 'completed') {
				paymentReceived = true;
				setTimeout(() => {
					resetQr();
				}, 5000);
			}
		}
	});

	async function generateQr() {
		if (amount <= 0) return;
		creating = true;
		try {
			// Create a pending fonepay payment in Convex
			// We need an orderId — for counter payments without an order, we skip
			showQr = true;
		} catch (e) {
			console.error('Failed to create payment:', e);
		} finally {
			creating = false;
		}
	}

	function resetQr() {
		showQr = false;
		amount = 0;
		paymentReceived = false;
		currentPaymentId = null;
	}

	async function confirmManual() {
		paymentReceived = true;
		setTimeout(() => {
			resetQr();
		}, 3000);
	}
</script>

<div class="p-8 space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
			<QrCode size={32} />
			{i18n.t('fonepay.title')}
		</h1>
		<p class="text-muted-foreground mt-1">{i18n.t('fonepay.generate')}</p>
	</div>

	<div class="grid grid-cols-2 gap-6">
		<!-- QR Generator -->
		<Card class="p-6 space-y-5">
			{#if !showQr}
				<h2 class="text-lg font-semibold flex items-center gap-2">
					<Banknote size={20} />
					{i18n.t('fonepay.generate')}
				</h2>

				<div class="space-y-4">
					<div>
						<label class="text-sm font-medium mb-1.5 block" for="merchantId">{i18n.t('fonepay.merchantId')}</label>
						<Input id="merchantId" bind:value={merchantId} disabled />
					</div>
					<div>
						<label class="text-sm font-medium mb-1.5 block" for="payAmount">{i18n.t('fonepay.amount')} (रू)</label>
						<Input id="payAmount" type="number" bind:value={amount} placeholder={i18n.t('fonepay.enterAmount')} />
					</div>
				</div>

				<!-- Quick amounts -->
				<div class="space-y-2">
					<p class="text-xs text-muted-foreground font-medium">{i18n.t('fonepay.quickAmounts')}</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [100, 250, 500, 1000] as quick}
							<Button variant="outline" size="sm" onclick={() => (amount = quick)}>
								{formatCurrency(quick)}
							</Button>
						{/each}
					</div>
				</div>

				<Button class="w-full" onclick={generateQr} disabled={amount <= 0 || creating}>
					{#if creating}
						<Loader2 size={16} class="animate-spin" />
					{:else}
						<QrCode size={16} />
					{/if}
					{i18n.t('fonepay.generate')}
				</Button>
			{:else if paymentReceived}
				<!-- Payment received animation -->
				<div class="flex flex-col items-center space-y-4 py-8">
					<div class="flex h-24 w-24 items-center justify-center rounded-full bg-success/20 animate-bounce">
						<CheckCircle size={48} class="text-success" />
					</div>
					<h2 class="text-2xl font-bold text-success">{i18n.t('fonepay.paymentReceived')}</h2>
					<p class="text-3xl font-bold">{formatCurrency(amount)}</p>
					<p class="text-sm text-muted-foreground">{i18n.t('fonepay.merchantId')}: {merchantId}</p>
				</div>
			{:else}
				<!-- QR Display -->
				<div class="flex flex-col items-center space-y-4">
					<Badge variant="success" class="text-sm px-3 py-1">{i18n.t('fonepay.qrReady')}</Badge>

					<div class="bg-white rounded-2xl p-3">
						<QrCodeSvg data={fonepayQrData} size={240} />
					</div>

					<div class="text-center">
						<p class="text-3xl font-bold text-primary">{formatCurrency(amount)}</p>
						<p class="text-sm text-muted-foreground mt-1">{i18n.t('fonepay.merchantId')}: {merchantId}</p>
					</div>

					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<Loader2 size={12} class="animate-spin" />
						{i18n.t('fonepay.waitingPayment')}
					</div>

					<p class="text-sm text-muted-foreground text-center">
						{i18n.t('fonepay.scanInstruction')}
					</p>

					<div class="flex gap-2 w-full">
						<Button variant="outline" class="flex-1" onclick={resetQr}>
							<RefreshCw size={14} /> {i18n.t('fonepay.newPayment')}
						</Button>
						<Button variant="success" class="flex-1" onclick={confirmManual}>
							<CheckCircle size={14} /> {i18n.t('fonepay.confirmReceived')}
						</Button>
					</div>
				</div>
			{/if}
		</Card>

		<!-- Recent Payments from Convex -->
		<Card class="p-6">
			<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
				<History size={20} />
				{i18n.t('fonepay.recentPayments')}
			</h2>

			{#if data.isLoading}
				<div class="space-y-3">
					<Skeleton variant="card" count={3} class="h-16" />
				</div>
			{:else if fonepayPayments.length === 0}
				<div class="text-center py-8 text-sm text-muted-foreground">
					{i18n.t('common.noData')}
				</div>
			{:else}
				<div class="space-y-3">
					{#each fonepayPayments as payment}
						<div class="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
							<div class="flex items-center gap-3">
								{#if payment.status === 'completed'}
									<CheckCircle size={20} class="text-success" />
								{:else if payment.status === 'pending'}
									<Loader2 size={20} class="text-warning animate-spin" />
								{:else}
									<XCircle size={20} class="text-destructive" />
								{/if}
								<div>
									<p class="text-sm font-medium">{payment.externalRef ?? payment._id.slice(-8)}</p>
									<p class="text-xs text-muted-foreground">
										{timeAgo(payment._creationTime ?? Date.now())} ago
									</p>
								</div>
							</div>
							<div class="text-right">
								<p class="font-semibold">{formatCurrency(payment.amount)}</p>
								<Badge
									variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'destructive'}
									class="text-[10px]"
								>
									{i18n.t(`status.${payment.status}`)}
								</Badge>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-4 pt-4 border-t">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">{i18n.t('fonepay.todayTotal')}</span>
					<span class="font-bold text-success">
						{formatCurrency(todayFonepayTotal)}
					</span>
				</div>
			</div>
		</Card>
	</div>
</div>
