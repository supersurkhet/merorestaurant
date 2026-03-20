<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency, timeAgo } from '$lib/utils';
	import type { OrderStatus } from '$lib/types';
	import { ChefHat, Clock, CheckCircle, ArrowRight, Bell, Flame } from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	type KitchenFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready';
	let activeFilter = $state<KitchenFilter>('all');

	const filteredOrders = $derived(
		data.activeOrders
			.filter((o) => activeFilter === 'all' || o.status === activeFilter)
			.sort((a, b) => a.createdAt - b.createdAt)
	);

	const filters: { key: KitchenFilter; label: string; count: number }[] = $derived([
		{ key: 'all', label: 'All Active', count: data.activeOrders.length },
		{ key: 'pending', label: i18n.t('status.pending'), count: data.orders.filter((o) => o.status === 'pending').length },
		{ key: 'confirmed', label: i18n.t('status.confirmed'), count: data.orders.filter((o) => o.status === 'confirmed').length },
		{ key: 'preparing', label: i18n.t('status.preparing'), count: data.orders.filter((o) => o.status === 'preparing').length },
		{ key: 'ready', label: i18n.t('status.ready'), count: data.orders.filter((o) => o.status === 'ready').length }
	]);

	function nextStatus(current: OrderStatus): OrderStatus | null {
		const flow: Record<string, OrderStatus> = {
			pending: 'confirmed',
			confirmed: 'preparing',
			preparing: 'ready',
			ready: 'served'
		};
		return flow[current] ?? null;
	}

	function statusColor(status: string): string {
		const map: Record<string, string> = {
			pending: 'border-l-amber-400',
			confirmed: 'border-l-blue-400',
			preparing: 'border-l-orange-500',
			ready: 'border-l-emerald-500'
		};
		return map[status] ?? '';
	}

	function urgencyLevel(createdAt: number): 'normal' | 'warning' | 'urgent' {
		const minutes = (Date.now() - createdAt) / 60_000;
		if (minutes > 30) return 'urgent';
		if (minutes > 15) return 'warning';
		return 'normal';
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
				<ChefHat size={32} />
				{i18n.t('nav.kitchen')}
			</h1>
			<p class="text-muted-foreground mt-1">Real-time order queue</p>
		</div>
		<div class="flex items-center gap-2">
			<Bell size={20} class="text-muted-foreground" />
			<Badge variant="default">{data.activeOrders.length} active</Badge>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex gap-2">
		{#each filters as filter}
			<Button
				variant={activeFilter === filter.key ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeFilter = filter.key)}
			>
				{filter.label}
				{#if filter.count > 0}
					<span class="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-background/20 text-[10px] font-bold px-1">
						{filter.count}
					</span>
				{/if}
			</Button>
		{/each}
	</div>

	<!-- Order Grid -->
	{#if filteredOrders.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
			<ChefHat size={48} class="mb-4 opacity-50" />
			<p class="text-lg">No orders in this queue</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
			{#each filteredOrders as order}
				{@const urgency = urgencyLevel(order.createdAt)}
				<Card
					class="border-l-4 {statusColor(order.status)} overflow-hidden {urgency === 'urgent'
						? 'ring-2 ring-destructive/50 animate-pulse'
						: urgency === 'warning'
							? 'ring-1 ring-warning/50'
							: ''}"
				>
					<!-- Order Header -->
					<div class="flex items-center justify-between p-4 pb-2">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
								{#if order.tableNumber}
									T{order.tableNumber}
								{:else}
									TK
								{/if}
							</div>
							<div>
								<p class="text-sm font-semibold">Order #{order._id.slice(-4)}</p>
								<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Clock size={12} />
									{timeAgo(order.createdAt)}
									{#if urgency === 'urgent'}
										<Flame size={12} class="text-destructive" />
									{/if}
								</div>
							</div>
						</div>
						<Badge
							variant={order.status === 'ready'
								? 'success'
								: order.status === 'preparing'
									? 'default'
									: order.status === 'pending'
										? 'warning'
										: 'secondary'}
						>
							{i18n.t(`status.${order.status}`)}
						</Badge>
					</div>

					<!-- Items -->
					<div class="px-4 py-2 space-y-1.5">
						{#each order.items as item}
							<div class="flex items-center justify-between text-sm">
								<span>
									<span class="font-medium text-primary">{item.quantity}x</span>
									{item.name}
								</span>
							</div>
						{/each}
					</div>

					<!-- Notes -->
					{#if order.notes}
						<div class="mx-4 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
							{order.notes}
						</div>
					{/if}

					<!-- Actions -->
					<div class="flex items-center justify-between border-t p-4 mt-2">
						<span class="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
						{#if nextStatus(order.status)}
							{@const next = nextStatus(order.status)!}
							<Button
								size="sm"
								variant={next === 'served' ? 'success' : 'default'}
								onclick={() => {
									data.updateOrderStatus(order._id, next);
									if (next === 'served' && order.tableId) {
										data.updateTableStatus(order.tableId, 'cleaning');
									}
								}}
							>
								{#if next === 'confirmed'}
									<CheckCircle size={14} /> Confirm
								{:else if next === 'preparing'}
									<ChefHat size={14} /> {i18n.t('order.markPreparing')}
								{:else if next === 'ready'}
									<CheckCircle size={14} /> {i18n.t('order.markReady')}
								{:else if next === 'served'}
									<ArrowRight size={14} /> {i18n.t('order.markServed')}
								{/if}
							</Button>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
