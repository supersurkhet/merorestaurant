<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import QrCodeSvg from '$lib/components/QrCode.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency } from '$lib/utils';
	import type { Table, TableStatus } from '$lib/types';
	import {
		Table2,
		Users,
		Clock,
		Utensils,
		Sparkles,
		CalendarCheck,
		QrCode,
		Printer,
		X,
		ShoppingBag,
		GripVertical
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();
	const RESTAURANT_ID = 'merorestaurant-surkhet';

	type FilterType = 'all' | TableStatus;
	let activeFilter = $state<FilterType>('all');
	let selectedTable = $state<Table | null>(null);
	let showQrDialog = $state(false);
	let qrTableId = $state('');

	// Drag state
	let draggingId = $state<string | null>(null);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragOrigX = $state(0);
	let dragOrigY = $state(0);

	const filteredTables = $derived(
		activeFilter === 'all'
			? data.tables
			: data.tables.filter((t) => t.status === activeFilter)
	);

	const statusStyle: Record<TableStatus, { fill: string; border: string; text: string; label: string }> = {
		available: { fill: 'bg-emerald-500/15', border: 'border-emerald-500/50', text: 'text-emerald-500', label: 'Available' },
		occupied: { fill: 'bg-red-500/15', border: 'border-red-500/50', text: 'text-red-500', label: 'Occupied' },
		reserved: { fill: 'bg-amber-500/15', border: 'border-amber-500/50', text: 'text-amber-500', label: 'Reserved' },
		cleaning: { fill: 'bg-slate-400/15', border: 'border-slate-400/50', text: 'text-slate-400', label: 'Cleaning' }
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

	function getTableOrder(tableId: string) {
		const table = data.tables.find((t) => t._id === tableId);
		if (!table?.currentOrderId) return null;
		return data.orders.find((o) => o._id === table.currentOrderId) ?? null;
	}

	function tableQrData(tableId: string): string {
		return JSON.stringify({ restaurantId: RESTAURANT_ID, tableId });
	}

	function openTableDetails(table: Table) {
		selectedTable = table;
	}

	function openTableQr(tableId: string) {
		qrTableId = tableId;
		showQrDialog = true;
	}

	function printTableQr() {
		const qrEl = document.getElementById('qr-print-area');
		if (!qrEl) return;
		const win = window.open('', '_blank', 'width=400,height=500');
		if (win) {
			const table = data.tables.find((t) => t._id === qrTableId);
			win.document.write(`
				<div style="text-align:center;font-family:sans-serif;padding:20px;">
					<h2 style="margin:0;">Mero Restaurant</h2>
					<p style="color:#666;margin:4px 0 16px;">Table ${table?.number ?? ''}</p>
					${qrEl.innerHTML}
					<p style="margin-top:16px;font-size:12px;color:#999;">Scan to view menu & order</p>
				</div>
			`);
			win.print();
		}
	}

	// Drag handlers for floor plan
	function startDrag(e: MouseEvent, table: Table) {
		if (e.button !== 0) return;
		draggingId = table._id;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragOrigX = table.x;
		dragOrigY = table.y;
		e.preventDefault();
	}

	function onMouseMove(e: MouseEvent) {
		if (!draggingId) return;
		const table = data.tables.find((t) => t._id === draggingId);
		if (!table) return;
		table.x = Math.max(10, Math.min(590, dragOrigX + (e.clientX - dragStartX)));
		table.y = Math.max(10, Math.min(430, dragOrigY + (e.clientY - dragStartY)));
	}

	function onMouseUp() {
		draggingId = null;
	}

	function tableShape(seats: number): string {
		if (seats > 6) return 'w-[130px] h-[100px] rounded-2xl';
		if (seats > 2) return 'w-[100px] h-[100px] rounded-xl';
		return 'w-[80px] h-[80px] rounded-full';
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div class="flex h-full">
	<!-- Main Content -->
	<div class="flex-1 p-8 space-y-6 overflow-y-auto">
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
				{#each (['available', 'occupied', 'reserved', 'cleaning'] as TableStatus[]) as status}
					{@const style = statusStyle[status]}
					{@const count = data.tables.filter((t) => t.status === status).length}
					<div class="flex items-center gap-1.5 text-xs">
						<div class="h-3 w-3 rounded-full {style.fill} border {style.border}"></div>
						<span class="text-muted-foreground">{style.label}</span>
						<span class="font-semibold">{count}</span>
					</div>
				{/each}
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

		<!-- Visual Floor Plan (draggable) -->
		<Card class="p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold flex items-center gap-2">
					<GripVertical size={18} class="text-muted-foreground" />
					Floor Plan
					<span class="text-xs text-muted-foreground font-normal">(drag tables to rearrange)</span>
				</h2>
			</div>
			<div
				class="relative h-[500px] rounded-xl border-2 border-dashed border-border bg-accent/20 overflow-hidden select-none"
			>
				<!-- Entrance marker -->
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2 pointer-events-none">
					<div class="h-px w-8 bg-muted-foreground/50"></div>
					Entrance
					<div class="h-px w-8 bg-muted-foreground/50"></div>
				</div>

				<!-- Kitchen marker -->
				<div class="absolute top-4 right-4 text-xs text-muted-foreground uppercase tracking-widest bg-accent rounded-md px-2 py-1 pointer-events-none">
					Kitchen &rarr;
				</div>

				{#each filteredTables as table (table._id)}
					{@const style = statusStyle[table.status]}
					<button
						class="absolute flex flex-col items-center justify-center border-2 transition-shadow cursor-grab active:cursor-grabbing hover:shadow-xl {tableShape(table.seats)} {style.fill} {style.border} {draggingId === table._id ? 'shadow-2xl scale-110 z-10' : 'hover:scale-105'}"
						style="left: {table.x}px; top: {table.y}px;"
						onmousedown={(e) => startDrag(e, table)}
						onclick={() => openTableDetails(table)}
					>
						<span class="text-xl font-bold {style.text}">{table.number}</span>
						<div class="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
							<Users size={9} />{table.seats}
						</div>
						{#if table.reservedBy}
							<span class="text-[8px] text-muted-foreground mt-0.5 truncate max-w-full px-1">
								{table.reservedBy}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</Card>

		<!-- Table Cards Grid -->
		<div class="grid grid-cols-4 gap-3">
			{#each filteredTables as table (table._id)}
				{@const style = statusStyle[table.status]}
				<Card class="p-4 hover:shadow-md transition-shadow cursor-pointer" onclick={() => openTableDetails(table)}>
					<div class="flex items-center justify-between mb-2">
						<span class="text-lg font-bold">Table {table.number}</span>
						<Badge variant={table.status === 'available' ? 'success' : table.status === 'occupied' ? 'destructive' : table.status === 'reserved' ? 'warning' : 'secondary'}>
							{i18n.t(`status.${table.status}`)}
						</Badge>
					</div>
					<div class="flex items-center gap-1 text-sm text-muted-foreground">
						<Users size={14} /> {table.seats} seats
					</div>
					{#if table.reservedBy}
						<p class="text-xs text-muted-foreground mt-1">Reserved: {table.reservedBy}</p>
					{/if}
					<div class="mt-3 flex gap-2">
						<Button size="sm" variant="outline" class="flex-1" onclick={(e) => { e.stopPropagation(); cycleStatus(table._id, table.status); }}>
							{table.status === 'available' ? 'Seat' : table.status === 'occupied' ? 'Clean' : table.status === 'cleaning' ? 'Free' : 'Seat'}
						</Button>
						<Button size="sm" variant="ghost" onclick={(e) => { e.stopPropagation(); openTableQr(table._id); }}>
							<QrCode size={14} />
						</Button>
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<!-- Details Panel (slides in from right) -->
	{#if selectedTable}
		{@const style = statusStyle[selectedTable.status]}
		{@const order = getTableOrder(selectedTable._id)}
		<div class="w-80 border-l bg-card p-6 space-y-5 overflow-y-auto shrink-0">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold">Table {selectedTable.number}</h2>
				<Button size="icon" variant="ghost" onclick={() => (selectedTable = null)}>
					<X size={18} />
				</Button>
			</div>

			<!-- Status -->
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full {style.fill} border {style.border}"></div>
				<span class="text-sm font-medium {style.text}">{i18n.t(`status.${selectedTable.status}`)}</span>
			</div>

			<!-- Info -->
			<div class="space-y-2 text-sm">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground">Seats</span>
					<span class="font-medium">{selectedTable.seats}</span>
				</div>
				{#if selectedTable.reservedBy}
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground">Reserved by</span>
						<span class="font-medium">{selectedTable.reservedBy}</span>
					</div>
				{/if}
			</div>

			<!-- Current Order -->
			{#if order}
				<Card class="p-4 space-y-3">
					<div class="flex items-center gap-2">
						<ShoppingBag size={16} class="text-primary" />
						<span class="text-sm font-semibold">Current Order</span>
						<Badge variant={order.status === 'ready' ? 'success' : order.status === 'preparing' ? 'default' : 'warning'}>
							{order.status}
						</Badge>
					</div>
					<div class="space-y-1">
						{#each order.items as item}
							<div class="flex justify-between text-xs">
								<span>{item.quantity}x {item.name}</span>
								<span class="text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
							</div>
						{/each}
					</div>
					<div class="flex justify-between border-t pt-2 text-sm font-semibold">
						<span>Total</span>
						<span class="text-primary">{formatCurrency(order.totalAmount)}</span>
					</div>
				</Card>
			{:else}
				<div class="text-center py-4 text-sm text-muted-foreground">
					No active order
				</div>
			{/if}

			<!-- Table QR Code -->
			<div class="space-y-3">
				<h3 class="text-sm font-semibold flex items-center gap-1.5">
					<QrCode size={14} />
					Table QR Code
				</h3>
				<div class="flex justify-center">
					<QrCodeSvg data={tableQrData(selectedTable._id)} size={180} />
				</div>
				<p class="text-[10px] text-center text-muted-foreground">
					Scan to order from this table
				</p>
			</div>

			<!-- Actions -->
			<div class="space-y-2">
				<Button variant="outline" class="w-full" onclick={() => cycleStatus(selectedTable!._id, selectedTable!.status)}>
					{selectedTable.status === 'available' ? 'Seat Guests' : selectedTable.status === 'occupied' ? 'Mark Cleaning' : selectedTable.status === 'cleaning' ? 'Mark Available' : 'Seat Guests'}
				</Button>
				<Button variant="ghost" class="w-full" onclick={() => openTableQr(selectedTable!._id)}>
					<Printer size={14} /> Print QR Tent
				</Button>
			</div>
		</div>
	{/if}
</div>

<!-- Print QR Dialog -->
<Dialog bind:open={showQrDialog}>
	{@const table = data.tables.find((t) => t._id === qrTableId)}
	<div class="text-center space-y-4">
		<h2 class="text-xl font-bold">Table {table?.number} QR Code</h2>
		<p class="text-sm text-muted-foreground">Print this QR for the table tent card</p>
		<div id="qr-print-area" class="flex justify-center">
			<QrCodeSvg data={tableQrData(qrTableId)} size={240} />
		</div>
		<p class="text-xs text-muted-foreground">Scan to view menu & place order</p>
		<div class="flex gap-2 justify-center">
			<Button variant="outline" onclick={() => (showQrDialog = false)}>Close</Button>
			<Button onclick={printTableQr}>
				<Printer size={14} /> Print
			</Button>
		</div>
	</div>
</Dialog>
