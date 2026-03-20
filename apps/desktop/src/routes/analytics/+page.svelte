<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency } from '$lib/utils';
	import {
		BarChart3,
		TrendingUp,
		ShoppingBag,
		DollarSign,
		Star,
		ArrowUp,
		Clock
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	let period = $state<'today' | 'week' | 'month'>('today');

	// Use Convex analytics queries (preferred) with fallback to dashboard stats
	const statsFromConvex = $derived(data.dashboardStats);
	const revenueData = $derived(data.dailyRevenue);
	const completedCount = $derived(
		statsFromConvex?.completedOrderCount ?? data.orders.filter((o: any) => ['completed', 'served'].includes(o.status)).length
	);
	const totalRevenue = $derived(
		(revenueData as any)?.totalRevenue ?? statsFromConvex?.totalRevenue ?? 0
	);
	const todayStats = $derived({
		revenue: totalRevenue,
		orders: completedCount,
		avgOrderValue: completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0,
		peakHour: '12:00 - 1:00 PM',
		avgPrepTime: '18 min'
	});

	// Popular items: prefer Convex analytics, fallback to local computation
	const popularItems = $derived.by(() => {
		const convexPopular = data.popularItems;
		if (convexPopular.length > 0) return convexPopular;
		// Fallback: compute from orders
		const itemMap = new Map<string, { name: string; nameNe: string; count: number; revenue: number }>();
		for (const order of data.orders) {
			for (const item of (order.items ?? [])) {
				const existing = itemMap.get(item.name) ?? { name: item.name, nameNe: '', count: 0, revenue: 0 };
				existing.count += item.quantity;
				existing.revenue += item.totalPrice ?? (item.unitPrice * item.quantity);
				itemMap.set(item.name, existing);
			}
		}
		return [...itemMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);
	});

	// Hourly orders: prefer Convex analytics, fallback to local computation
	const hourlyOrders = $derived.by(() => {
		const convexHourly = data.ordersByHour;
		if (convexHourly.length > 0) return convexHourly;
		// Fallback
		const hours = Array.from({ length: 14 }, (_, i) => ({
			hour: `${(i + 8) % 12 || 12}${i + 8 < 12 ? 'AM' : 'PM'}`,
			count: 0
		}));
		for (const order of data.orders) {
			const t = order._creationTime ?? order.createdAt ?? Date.now();
			const h = new Date(t).getHours();
			if (h >= 8 && h <= 21) hours[h - 8].count++;
		}
		return hours;
	});

	const maxHourly = $derived(Math.max(1, ...hourlyOrders.map((h: any) => h.count)));

	const methodColors: Record<string, string> = {
		cash: 'bg-emerald-500',
		fonepay: 'bg-blue-500',
		khalti: 'bg-purple-500',
		esewa: 'bg-green-500',
		card: 'bg-slate-500'
	};

	// Payment breakdown: prefer Convex analytics, fallback to local
	const paymentBreakdown = $derived.by(() => {
		const convexBreakdown = data.paymentBreakdown;
		if (convexBreakdown.length > 0) {
			return convexBreakdown.map((p: any) => ({
				method: (p.method ?? p._id ?? '').charAt(0).toUpperCase() + (p.method ?? p._id ?? '').slice(1),
				amount: p.total ?? p.amount ?? 0,
				percent: p.percent ?? 0,
				color: methodColors[(p.method ?? p._id ?? '').toLowerCase()] ?? 'bg-slate-500'
			}));
		}
		// Fallback
		const payments = data.payments.filter((p: any) => p.status === 'completed');
		const byMethod = new Map<string, number>();
		let total = 0;
		for (const p of payments) {
			byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount);
			total += p.amount;
		}
		if (total === 0) return [];
		return [...byMethod.entries()]
			.map(([method, amount]) => ({
				method: method.charAt(0).toUpperCase() + method.slice(1),
				amount,
				percent: Math.round((amount / total) * 100),
				color: methodColors[method] ?? 'bg-slate-500'
			}))
			.sort((a, b) => b.amount - a.amount);
	});
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
				<BarChart3 size={32} />
				{i18n.t('nav.analytics')}
			</h1>
			<p class="text-muted-foreground mt-1">Restaurant performance insights</p>
		</div>
		<div class="flex gap-2">
			{#each [
				{ key: 'today', label: i18n.t('analytics.today') },
				{ key: 'week', label: i18n.t('analytics.thisWeek') },
				{ key: 'month', label: i18n.t('analytics.thisMonth') }
			] as p}
				<Button
					variant={period === p.key ? 'default' : 'outline'}
					size="sm"
					onclick={() => (period = p.key as typeof period)}
				>
					{p.label}
				</Button>
			{/each}
		</div>
	</div>

	{#if data.isLoading}
		<div class="grid grid-cols-4 gap-4">
			{#each Array(4) as _}
				<Card class="p-5 space-y-3">
					<Skeleton variant="text" class="w-24 h-3" />
					<Skeleton variant="text" class="w-20 h-7" />
					<Skeleton variant="text" class="w-32 h-3" />
				</Card>
			{/each}
		</div>
		<div class="grid grid-cols-3 gap-6">
			<div class="col-span-2">
				<Card class="p-6"><Skeleton variant="chart" /></Card>
			</div>
			<Card class="p-6"><Skeleton variant="chart" /></Card>
		</div>
	{:else}
		<!-- KPI Cards -->
		<div class="grid grid-cols-4 gap-4">
			<Card class="p-5">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-muted-foreground">{i18n.t('analytics.revenue')}</span>
					<DollarSign size={18} class="text-emerald-500" />
				</div>
				<p class="text-2xl font-bold">{formatCurrency(todayStats.revenue)}</p>
				<div class="flex items-center gap-1 mt-1 text-xs text-emerald-500">
					<TrendingUp size={12} />
					{i18n.t('analytics.today')}
				</div>
			</Card>

			<Card class="p-5">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-muted-foreground">{i18n.t('analytics.orders')}</span>
					<ShoppingBag size={18} class="text-blue-500" />
				</div>
				<p class="text-2xl font-bold">{todayStats.orders}</p>
				<div class="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
					{i18n.t('status.completed')}
				</div>
			</Card>

			<Card class="p-5">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-muted-foreground">{i18n.t('analytics.avgOrderValue')}</span>
					<ArrowUp size={18} class="text-amber-500" />
				</div>
				<p class="text-2xl font-bold">{formatCurrency(todayStats.avgOrderValue)}</p>
			</Card>

			<Card class="p-5">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-muted-foreground">{i18n.t('analytics.avgPrepTime')}</span>
					<Clock size={18} class="text-purple-500" />
				</div>
				<p class="text-2xl font-bold">{todayStats.avgPrepTime}</p>
				<div class="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
					Peak: {todayStats.peakHour}
				</div>
			</Card>
		</div>

		<div class="grid grid-cols-3 gap-6">
			<!-- Hourly Orders Chart -->
			<div class="col-span-2">
				<Card class="p-6">
					<h2 class="text-lg font-semibold mb-4">{i18n.t('analytics.ordersByHour')}</h2>
					{#if hourlyOrders.length > 0}
						<div class="flex items-end gap-1.5 h-48">
							{#each hourlyOrders as hour}
								{@const heightPercent = ((hour.count ?? 0) / maxHourly) * 100}
								<div class="flex-1 flex flex-col items-center gap-1">
									<span class="text-[10px] text-muted-foreground">{hour.count}</span>
									<div
										class="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
										style="height: {heightPercent}%"
										title="{hour.hour}: {hour.count} orders"
									></div>
									<span class="text-[9px] text-muted-foreground">{hour.hour}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground text-center py-8">{i18n.t('common.noData')}</p>
					{/if}
				</Card>
			</div>

			<!-- Payment Breakdown -->
			<Card class="p-6">
				<h2 class="text-lg font-semibold mb-4">{i18n.t('analytics.paymentMethods')}</h2>
				{#if paymentBreakdown.length > 0}
					<div class="space-y-4">
						{#each paymentBreakdown as payment}
							<div class="space-y-1.5">
								<div class="flex items-center justify-between text-sm">
									<span>{payment.method}</span>
									<span class="font-semibold">{formatCurrency(payment.amount)}</span>
								</div>
								<div class="h-2 rounded-full bg-muted overflow-hidden">
									<div class="h-full rounded-full {payment.color} transition-all" style="width: {payment.percent}%"></div>
								</div>
								<p class="text-[10px] text-muted-foreground text-right">{payment.percent}%</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground text-center py-8">{i18n.t('common.noData')}</p>
				{/if}
			</Card>
		</div>

		<!-- Popular Items -->
		<Card class="p-6">
			<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
				<Star size={20} class="text-amber-500" />
				{i18n.t('analytics.popular')}
			</h2>
			{#if popularItems.length > 0}
				<div class="grid grid-cols-2 gap-3">
					{#each popularItems as item, idx}
						<div class="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
								#{idx + 1}
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium truncate">{item.name}</p>
							</div>
							<div class="text-right">
								<p class="text-sm font-semibold">{item.count} sold</p>
								<p class="text-xs text-muted-foreground">{formatCurrency(item.revenue)}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground text-center py-8">{i18n.t('common.noData')}</p>
			{/if}
		</Card>
	{/if}
</div>
