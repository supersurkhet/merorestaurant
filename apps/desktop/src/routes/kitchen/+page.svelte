<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency, timeAgo } from '$lib/utils';
	import {
		ChefHat,
		Clock,
		CheckCircle,
		ArrowRight,
		Bell,
		BellOff,
		Flame,
		Printer,
		Timer,
		RefreshCw
	} from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';
	import { getAuth } from '$lib/stores/auth.svelte';

	const data = getData();
	const i18n = getI18n();
	const auth = getAuth();

	type KitchenFilter = 'all' | 'placed' | 'confirmed' | 'preparing' | 'ready';
	let activeFilter = $state<KitchenFilter>('all');
	let soundEnabled = $state(true);
	let lastRefresh = $state(Date.now());
	let secondsSinceRefresh = $state(0);
	let previousOrderCount = $state(data.activeOrders.length);
	let refreshInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		refreshInterval = setInterval(() => {
			secondsSinceRefresh = Math.floor((Date.now() - lastRefresh) / 1000);

			// Check for new orders and play notification
			const currentCount = data.activeOrders.length;
			if (currentCount > previousOrderCount && soundEnabled) {
				playNotification();
			}
			previousOrderCount = currentCount;
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(refreshInterval);
	});

	function playNotification() {
		try {
			const ctx = new AudioContext();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.frequency.value = 880;
			osc.type = 'sine';
			gain.gain.value = 0.3;
			gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.5);
		} catch {
			// Audio not available in some environments
		}
	}

	function refreshNow() {
		lastRefresh = Date.now();
		secondsSinceRefresh = 0;
	}

	// Mark all preparing orders as ready
	async function markAllReady() {
		const preparing = data.orders.filter((o: any) => o.status === 'preparing');
		for (const order of preparing) {
			await data.updateOrderStatus(order._id, 'ready');
		}
	}

	const isReadOnly = $derived(!auth.canEditKitchen);

	function orderTime(order: any): number {
		return order._creationTime ?? order.createdAt ?? Date.now();
	}

	const filteredOrders = $derived(
		data.activeOrders
			.filter((o: any) => activeFilter === 'all' || o.status === activeFilter)
			.sort((a: any, b: any) => orderTime(a) - orderTime(b))
	);

	const filters: { key: KitchenFilter; label: string; count: number }[] = $derived([
		{ key: 'all', label: 'All Active', count: data.activeOrders.length },
		{ key: 'placed', label: i18n.t('status.placed'), count: data.orders.filter((o: any) => o.status === 'placed').length },
		{ key: 'confirmed', label: i18n.t('status.confirmed'), count: data.orders.filter((o: any) => o.status === 'confirmed').length },
		{ key: 'preparing', label: i18n.t('status.preparing'), count: data.orders.filter((o: any) => o.status === 'preparing').length },
		{ key: 'ready', label: i18n.t('status.ready'), count: data.orders.filter((o: any) => o.status === 'ready').length }
	]);

	function nextStatus(current: string): string | null {
		const flow: Record<string, string> = {
			placed: 'confirmed',
			confirmed: 'preparing',
			preparing: 'ready',
			ready: 'served'
		};
		return flow[current] ?? null;
	}

	function statusColor(status: string): string {
		return {
			placed: 'border-l-amber-400',
			confirmed: 'border-l-blue-400',
			preparing: 'border-l-orange-500',
			ready: 'border-l-emerald-500'
		}[status] ?? '';
	}

	function orderWaitMinutes(createdAt: number): number {
		return Math.floor((Date.now() - createdAt) / 60_000);
	}

	function urgencyColor(minutes: number): string {
		if (minutes > 20) return 'text-red-500 bg-red-500/10';
		if (minutes > 10) return 'text-amber-500 bg-amber-500/10';
		return 'text-emerald-500 bg-emerald-500/10';
	}

	function urgencyRing(minutes: number): string {
		if (minutes > 20) return 'ring-2 ring-red-500/40';
		if (minutes > 10) return 'ring-1 ring-amber-500/30';
		return '';
	}

	function getItemPrepTime(menuItemId: string): number {
		const item = data.menuItems.find((m: any) => m._id === menuItemId);
		return item?.preparationTime ?? item?.sortOrder ?? 15;
	}

	function printOrder(orderId: string) {
		const order = data.orders.find((o: any) => o._id === orderId);
		if (!order) return;
		const items = order.items ?? [];
		const ticket = [
			'================================',
			'     MERO RESTAURANT - KITCHEN   ',
			'================================',
			`Order: ${order.orderNumber ?? '#' + order._id.slice(-4)}`,
			`Table: ${order.tableId ? 'Dine-in' : 'Takeaway'}`,
			`Time: ${new Date(orderTime(order)).toLocaleTimeString()}`,
			'--------------------------------',
			...items.map((item: any) => `${item.quantity}x ${item.name}`),
			'--------------------------------',
			...(order.notes ? [`NOTE: ${order.notes}`, '--------------------------------'] : []),
			`Total: ${formatCurrency(order.total ?? order.totalAmount ?? 0)}`,
			'================================'
		].join('\n');
		const win = window.open('', '_blank', 'width=300,height=500');
		if (win) {
			win.document.write(`<pre style="font-family:monospace;font-size:12px;">${ticket}</pre>`);
			win.print();
		}
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
		<div class="flex items-center gap-3">
			<!-- Auto-refresh timer -->
			<button
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
				onclick={refreshNow}
			>
				<RefreshCw size={12} />
				Updated {secondsSinceRefresh}s ago
			</button>

			<!-- Sound toggle -->
			<button
				class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors {soundEnabled ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground'}"
				onclick={() => {
					soundEnabled = !soundEnabled;
					if (soundEnabled) playNotification();
				}}
			>
				{#if soundEnabled}
					<Bell size={14} />
				{:else}
					<BellOff size={14} />
				{/if}
				{soundEnabled ? 'Sound On' : 'Sound Off'}
			</button>

			<Badge variant="default">{data.activeOrders.length} active</Badge>
		</div>
	</div>

	<!-- Actions bar -->
	{#if !isReadOnly && data.orders.filter((o: any) => o.status === 'preparing').length > 0}
		<div class="flex justify-end">
			<Button variant="success" size="sm" onclick={markAllReady}>
				<CheckCircle size={14} /> {i18n.t('order.markAllReady')} ({data.orders.filter((o: any) => o.status === 'preparing').length})
			</Button>
		</div>
	{/if}

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
				{@const waitMin = orderWaitMinutes(orderTime(order))}
				<Card class="border-l-4 {statusColor(order.status)} overflow-hidden {urgencyRing(waitMin)}">
					<!-- Order Header -->
					<div class="flex items-center justify-between p-4 pb-2">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
								{order.orderNumber ?? 'TK'}
							</div>
							<div>
								<p class="text-sm font-semibold">{order.orderNumber ?? 'Order #' + order._id.slice(-4)}</p>
								<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Clock size={12} />
									{timeAgo(orderTime(order))}
								</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<!-- Urgency timer pill -->
							<div class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold {urgencyColor(waitMin)}">
								{#if waitMin > 20}
									<Flame size={11} />
								{:else}
									<Timer size={11} />
								{/if}
								{waitMin}m
							</div>
							<Badge
								variant={order.status === 'ready'
									? 'success'
									: order.status === 'preparing'
										? 'default'
										: order.status === 'placed'
											? 'warning'
											: 'secondary'}
							>
								{i18n.t(`status.${order.status}`)}
							</Badge>
						</div>
					</div>

					<!-- Items with prep time -->
					<div class="px-4 py-2 space-y-1">
						{#each (order.items ?? []) as item}
							{@const prepTime = getItemPrepTime(item.menuItemId)}
							<div class="flex items-center justify-between text-sm">
								<span>
									<span class="font-medium text-primary">{item.quantity}x</span>
									{item.name}
								</span>
								<span class="flex items-center gap-1 text-[10px] text-muted-foreground">
									<Timer size={9} />{prepTime}m
								</span>
							</div>
						{/each}
					</div>

					<!-- Notes -->
					{#if order.notes}
						<div class="mx-4 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground border border-warning/20">
							<span class="font-semibold">Note:</span> {order.notes}
						</div>
					{/if}

					<!-- Actions -->
					<div class="flex items-center justify-between border-t p-4 mt-2">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold">{formatCurrency(order.total ?? order.totalAmount ?? 0)}</span>
							<!-- Print button -->
							<Button size="icon" variant="ghost" class="h-7 w-7" onclick={() => printOrder(order._id)}>
								<Printer size={13} class="text-muted-foreground" />
							</Button>
						</div>
						{#if nextStatus(order.status) && !isReadOnly}
							{@const next = nextStatus(order.status)!}
							<Button
								size="sm"
								variant={next === 'served' ? 'success' : 'default'}
								onclick={() => data.updateOrderStatus(order._id, next as any)}
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
