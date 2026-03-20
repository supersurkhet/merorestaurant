<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency, timeAgo } from '$lib/utils';
	import {
		ShoppingBag,
		DollarSign,
		Table2,
		Clock,
		ArrowUpRight,
		ChefHat,
		Users
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	const stats = $derived([
		{
			label: 'Active Orders',
			value: data.activeOrders.length,
			icon: ShoppingBag,
			color: 'text-blue-500',
			bg: 'bg-blue-500/10'
		},
		{
			label: "Today's Revenue",
			value: formatCurrency(data.todayRevenue),
			icon: DollarSign,
			color: 'text-emerald-500',
			bg: 'bg-emerald-500/10'
		},
		{
			label: 'Available Tables',
			value: `${data.availableTableCount}/${data.tables.length}`,
			icon: Table2,
			color: 'text-amber-500',
			bg: 'bg-amber-500/10'
		},
		{
			label: 'Active Staff',
			value: data.staff.filter((s: any) => s.isActive).length,
			icon: Users,
			color: 'text-purple-500',
			bg: 'bg-purple-500/10'
		}
	]);

	const statusColors: Record<string, string> = {
		pending: 'warning',
		confirmed: 'secondary',
		preparing: 'default',
		ready: 'success',
		served: 'outline',
		completed: 'outline',
		cancelled: 'destructive'
	};
</script>

<div class="p-8 space-y-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">{i18n.t('nav.dashboard')}</h1>
		<p class="text-muted-foreground mt-1">Welcome back to Mero Restaurant, Surkhet</p>
	</div>

	{#if data.isLoading}
		<div class="flex items-center justify-center py-20">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-4 gap-4">
			{#each stats as stat}
				<Card class="p-5">
					<div class="flex items-center justify-between">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">{stat.label}</p>
							<p class="text-2xl font-bold">{stat.value}</p>
						</div>
						<div class={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
							<stat.icon size={24} class={stat.color} />
						</div>
					</div>
				</Card>
			{/each}
		</div>

		<div class="grid grid-cols-3 gap-6">
			<!-- Recent Orders -->
			<div class="col-span-2">
				<Card class="p-6">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold flex items-center gap-2">
							<Clock size={20} />
							Recent Orders
						</h2>
						<a href="/kitchen" class="text-sm text-primary hover:underline flex items-center gap-1">
							View all <ArrowUpRight size={14} />
						</a>
					</div>
					<div class="space-y-3">
						{#each data.orders.slice(0, 5) as order}
							<div class="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
								<div class="flex items-center gap-4">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
										{order.orderNumber ?? 'TK'}
									</div>
									<div>
										<p class="text-sm font-medium">
											{(order.items ?? []).map((i: any) => i.name).join(', ') || order.orderNumber}
										</p>
										<p class="text-xs text-muted-foreground">
											{timeAgo(order._creationTime ?? order.createdAt ?? Date.now())} ago
											{#if order.items}
												· {order.items.length} items
											{/if}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<span class="text-sm font-semibold">{formatCurrency(order.total ?? order.totalAmount ?? 0)}</span>
									<Badge variant={statusColors[order.status] as any}>{order.status}</Badge>
								</div>
							</div>
						{/each}
						{#if data.orders.length === 0}
							<p class="text-sm text-muted-foreground text-center py-8">No orders yet</p>
						{/if}
					</div>
				</Card>
			</div>

			<!-- Quick Actions -->
			<div class="space-y-4">
				<Card class="p-6">
					<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
						<ChefHat size={20} />
						Kitchen Status
					</h2>
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Pending</span>
							<Badge variant="warning">{data.orders.filter((o: any) => o.status === 'pending').length}</Badge>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Preparing</span>
							<Badge variant="default">{data.orders.filter((o: any) => o.status === 'preparing').length}</Badge>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Ready</span>
							<Badge variant="success">{data.orders.filter((o: any) => o.status === 'ready').length}</Badge>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
						<Table2 size={20} />
						Table Overview
					</h2>
					<div class="grid grid-cols-4 gap-2">
						{#each data.tables as table}
							{@const colorMap: Record<string, string> = { available: 'bg-success/20 border-success/40 text-success', occupied: 'bg-destructive/20 border-destructive/40 text-destructive', reserved: 'bg-warning/20 border-warning/40 text-warning', cleaning: 'bg-muted border-muted text-muted-foreground' }}
							<div
								class={`flex h-10 w-full items-center justify-center rounded-lg border text-xs font-bold ${colorMap[table.status as string] ?? ''}`}
								title="{table.status} - {table.seats} seats"
							>
								{table.number}
							</div>
						{/each}
					</div>
				</Card>
			</div>
		</div>
	{/if}
</div>
