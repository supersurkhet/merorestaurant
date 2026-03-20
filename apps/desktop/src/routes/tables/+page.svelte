<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import type { TableStatus } from '$lib/types';
	import { Table2, Users, Clock, Utensils, Sparkles, CalendarCheck } from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	type FilterType = 'all' | TableStatus;
	let activeFilter = $state<FilterType>('all');

	const filteredTables = $derived(
		activeFilter === 'all'
			? data.tables
			: data.tables.filter((t) => t.status === activeFilter)
	);

	const statusConfig: Record<TableStatus, { color: string; bg: string; icon: typeof Table2 }> = {
		available: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: Sparkles },
		occupied: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', icon: Utensils },
		reserved: { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', icon: CalendarCheck },
		cleaning: { color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', icon: Clock }
	};

	function cycleStatus(tableId: string, current: TableStatus) {
		const cycle: Record<TableStatus, TableStatus> = {
			available: 'occupied',
			occupied: 'cleaning',
			cleaning: 'available',
			reserved: 'occupied'
		};
		data.updateTableStatus(tableId, cycle[current]);
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
				<Table2 size={32} />
				{i18n.t('nav.tables')}
			</h1>
			<p class="text-muted-foreground mt-1">Manage restaurant floor layout</p>
		</div>
		<div class="flex gap-3">
			<Badge variant="success">{data.availableTableCount} available</Badge>
			<Badge variant="destructive">{data.occupiedTableCount} occupied</Badge>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex gap-2">
		{#each [
			{ key: 'all', label: 'All Tables' },
			{ key: 'available', label: i18n.t('status.available') },
			{ key: 'occupied', label: i18n.t('status.occupied') },
			{ key: 'reserved', label: i18n.t('status.reserved') },
			{ key: 'cleaning', label: i18n.t('status.cleaning') }
		] as filter}
			<Button
				variant={activeFilter === filter.key ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeFilter = filter.key as FilterType)}
			>
				{filter.label}
			</Button>
		{/each}
	</div>

	<!-- Visual Floor Layout -->
	<Card class="p-6">
		<h2 class="text-lg font-semibold mb-4">Floor Plan</h2>
		<div class="relative h-[500px] rounded-xl border-2 border-dashed border-border bg-accent/20 overflow-hidden">
			<!-- Entrance marker -->
			<div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
				<div class="h-px w-8 bg-muted-foreground/50"></div>
				Entrance
				<div class="h-px w-8 bg-muted-foreground/50"></div>
			</div>

			<!-- Kitchen marker -->
			<div class="absolute top-4 right-4 text-xs text-muted-foreground uppercase tracking-widest bg-accent rounded-md px-2 py-1">
				Kitchen →
			</div>

			{#each filteredTables as table}
				{@const config = statusConfig[table.status]}
				<button
					class="absolute flex flex-col items-center justify-center rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer {config.bg}"
					style="left: {table.x}px; top: {table.y}px; width: {table.seats > 6 ? 140 : table.seats > 2 ? 110 : 85}px; height: {table.seats > 6 ? 110 : 85}px;"
					onclick={() => cycleStatus(table._id, table.status)}
					title="Click to change status"
				>
					<span class="text-xl font-bold {config.color}">{table.number}</span>
					<div class="flex items-center gap-1 text-xs text-muted-foreground mt-1">
						<Users size={10} />
						{table.seats}
					</div>
					<span class="text-[10px] mt-1 font-medium {config.color}">
						{i18n.t(`status.${table.status}`)}
					</span>
					{#if table.reservedBy}
						<span class="text-[9px] text-muted-foreground mt-0.5 truncate max-w-full px-2">
							{table.reservedBy}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	</Card>

	<!-- Table List -->
	<div class="grid grid-cols-4 gap-3">
		{#each filteredTables as table}
			{@const config = statusConfig[table.status]}
			<Card class="p-4 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<span class="text-lg font-bold">Table {table.number}</span>
					<Badge variant={table.status === 'available' ? 'success' : table.status === 'occupied' ? 'destructive' : table.status === 'reserved' ? 'warning' : 'secondary'}>
						{i18n.t(`status.${table.status}`)}
					</Badge>
				</div>
				<div class="flex items-center gap-1 text-sm text-muted-foreground">
					<Users size={14} />
					{table.seats} seats
				</div>
				{#if table.reservedBy}
					<p class="text-xs text-muted-foreground mt-1">Reserved: {table.reservedBy}</p>
				{/if}
				<div class="mt-3 flex gap-2">
					<Button size="sm" variant="outline" class="flex-1" onclick={() => cycleStatus(table._id, table.status)}>
						{table.status === 'available' ? 'Seat' : table.status === 'occupied' ? 'Clean' : table.status === 'cleaning' ? 'Free' : 'Seat'}
					</Button>
				</div>
			</Card>
		{/each}
	</div>
</div>
