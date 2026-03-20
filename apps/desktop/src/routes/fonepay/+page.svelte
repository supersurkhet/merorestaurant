<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency } from '$lib/utils';
	import { QrCode, Banknote, History, CheckCircle, XCircle, RefreshCw } from 'lucide-svelte';

	const i18n = getI18n();

	let amount = $state<number>(0);
	let merchantId = $state('MR-SURKHET-001');
	let showQr = $state(false);

	const recentPayments = [
		{ id: 'fp1', amount: 540, status: 'completed', time: '2 min ago', ref: 'FP-20240320-001' },
		{ id: 'fp2', amount: 1430, status: 'completed', time: '15 min ago', ref: 'FP-20240320-002' },
		{ id: 'fp3', amount: 340, status: 'failed', time: '30 min ago', ref: 'FP-20240320-003' },
		{ id: 'fp4', amount: 890, status: 'completed', time: '1 hr ago', ref: 'FP-20240320-004' }
	];

	function generateQr() {
		if (amount > 0) showQr = true;
	}

	function resetQr() {
		showQr = false;
		amount = 0;
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
			<QrCode size={32} />
			{i18n.t('nav.fonepay')}
		</h1>
		<p class="text-muted-foreground mt-1">Generate payment QR codes for counter payments</p>
	</div>

	<div class="grid grid-cols-2 gap-6">
		<!-- QR Generator -->
		<Card class="p-6 space-y-5">
			{#if !showQr}
				<h2 class="text-lg font-semibold flex items-center gap-2">
					<Banknote size={20} />
					Generate Payment QR
				</h2>

				<div class="space-y-4">
					<div>
						<label class="text-sm font-medium mb-1.5 block" for="merchantId">Merchant ID</label>
						<Input id="merchantId" bind:value={merchantId} disabled />
					</div>
					<div>
						<label class="text-sm font-medium mb-1.5 block" for="payAmount">Amount (रू)</label>
						<Input id="payAmount" type="number" bind:value={amount} placeholder="Enter amount" />
					</div>
				</div>

				<!-- Quick amounts -->
				<div class="space-y-2">
					<p class="text-xs text-muted-foreground font-medium">Quick amounts</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [100, 250, 500, 1000] as quick}
							<Button variant="outline" size="sm" onclick={() => (amount = quick)}>
								{formatCurrency(quick)}
							</Button>
						{/each}
					</div>
				</div>

				<Button class="w-full" onclick={generateQr} disabled={amount <= 0}>
					<QrCode size={16} /> Generate QR Code
				</Button>
			{:else}
				<!-- QR Display -->
				<div class="flex flex-col items-center space-y-4">
					<Badge variant="success" class="text-sm px-3 py-1">Payment QR Ready</Badge>

					<div class="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-primary/30 bg-white">
						<div class="text-center space-y-2">
							<QrCode size={80} class="mx-auto text-primary" />
							<p class="text-xs text-muted-foreground">Fonepay QR</p>
						</div>
					</div>

					<div class="text-center">
						<p class="text-3xl font-bold text-primary">{formatCurrency(amount)}</p>
						<p class="text-sm text-muted-foreground mt-1">Merchant: {merchantId}</p>
					</div>

					<p class="text-sm text-muted-foreground text-center">
						Show this QR to the customer to scan with their Fonepay-enabled banking app
					</p>

					<div class="flex gap-2 w-full">
						<Button variant="outline" class="flex-1" onclick={resetQr}>
							<RefreshCw size={14} /> New Payment
						</Button>
						<Button variant="success" class="flex-1">
							<CheckCircle size={14} /> Confirm Received
						</Button>
					</div>
				</div>
			{/if}
		</Card>

		<!-- Recent Payments -->
		<Card class="p-6">
			<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
				<History size={20} />
				Recent Fonepay Payments
			</h2>

			<div class="space-y-3">
				{#each recentPayments as payment}
					<div class="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
						<div class="flex items-center gap-3">
							{#if payment.status === 'completed'}
								<CheckCircle size={20} class="text-success" />
							{:else}
								<XCircle size={20} class="text-destructive" />
							{/if}
							<div>
								<p class="text-sm font-medium">{payment.ref}</p>
								<p class="text-xs text-muted-foreground">{payment.time}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="font-semibold">{formatCurrency(payment.amount)}</p>
							<Badge variant={payment.status === 'completed' ? 'success' : 'destructive'} class="text-[10px]">
								{payment.status}
							</Badge>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 pt-4 border-t">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Today's Fonepay Total</span>
					<span class="font-bold text-success">
						{formatCurrency(recentPayments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0))}
					</span>
				</div>
			</div>
		</Card>
	</div>
</div>
