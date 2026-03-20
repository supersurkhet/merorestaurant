<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import QrCodeSvg from '$lib/components/QrCode.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency } from '$lib/utils';
	// Table statuses: available, occupied, reserved (root convex schema)
	import {
		Table2,
		Users,
		QrCode,
		Printer,
		X,
		ShoppingBag,
		GripVertical
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	type FilterType = 'all' | 'available' | 'occupied' | 'reserved';
	let activeFilter = $state<FilterType>('all');
	let selectedTable = $state<any | null>(null);
	let showQrDialog = $state(false);
	let qrTableId = $state('');

	const filteredTables = $derived(
		activeFilter === 'all'
			? data.tables
			: data.tables.filter((t: any) => t.status === activeFilter)
	);

	const statusStyle: Record<string, { fill: string; border: string; text: string; label: string }> = {
		available: { fill: 'bg-emerald-500/15', border: 'border-emerald-500/50', text: 'text-emerald-500', label: 'Available' },
		occupied: { fill: 'bg-red-500/15', border: 'border-red-500/50', text: 'text-red-500', label: 'Occupied' },
		reserved: { fill: 'bg-amber-500/15', border: 'border-amber-500/50', text: 'text-amber-500', label: 'Reserved' }
	};

	function cycleStatus(tableId: string, current: string) {
		const cycle: Record<string, string> = {
			available: 'occupied',
			occupied: 'available',
			reserved: 'occupied'
		};
		data.updateTableStatus(tableId, cycle[current] as any);
	}

	function getTableOrder(table: any) {
		if (!table?.currentOrderId) return null;
		return data.orders.find((o: any) => o._id === table.currentOrderId) ?? null;
	}

	function tableQrData(table: any): string {
		return JSON.stringify({ restaurantId: table.restaurantId, tableId: table._id, qrCode: table.qrCode });
	}

	function openTableDetails(table: any) {
		selectedTable = table;
	}

	function openTableQr(tableId: string) {
		qrTableId = tableId;
		showQrDialog = true;
	}

	function printTableQr() {
		const qrEl = document.getElementById('qr-print-area');
		if (!qrEl) return;
		const table = data.tables.find((t: any) => t._id === qrTableId);
		const win = window.open('', '_blank', 'width=400,height=500');
		if (win) {
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

	// Compute grid positions for floor plan (tables don't have x/y in Convex)
	function gridPosition(index: number): { x: number; y: number } {
		const cols = 4;
		const cellW = 150;
		const cellH = 130;
		const padX = 30;
		const padY = 30;
		const col = index % cols;
		const row = Math.floor(index / cols);
		return { x: padX + col * cellW, y: padY + row * cellH };
	}

	function tableShape(seats: number): string {
		if (seats > 6) return 'w-[120px] h-[90px] rounded-2xl';
		if (seats > 2) return 'w-[100px] h-[90px] rounded-xl';
		return 'w-[80px] h-[80px] rounded-full';
	}
</script>

<div class="flex h-full">
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
				{#each (['available', 'occupied', 'reserved'] as string[]) as status}
					{@const style = statusStyle[status]}
					{@const count = data.tables.filter((t: any) => t.status === status).length}
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

		<!-- Visual Floor Plan -->
		<Card class="p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold flex items-center gap-2">
					<GripVertical size={18} class="text-muted-foreground" />
					Floor Plan
				</h2>
			</div>
			<div class="relative rounded-xl border-2 border-dashed border-border bg-accent/20 overflow-hidden" style="height: {Math.ceil(filteredTables.length / 4) * 130 + 80}px; min-height: 300px;">
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2 pointer-events-none">
					<div class="h-px w-8 bg-muted-foreground/50"></div>
					Entrance
					<div class="h-px w-8 bg-muted-foreground/50"></div>
				</div>
				<div class="absolute top-4 right-4 text-xs text-muted-foreground uppercase tracking-widest bg-accent rounded-md px-2 py-1 pointer-events-none">
					Kitchen &rarr;
				</div>

				{#each filteredTables as table, idx (table._id)}
					{@const style = statusStyle[table.status] ?? statusStyle.available}
					{@const pos = gridPosition(idx)}
					<button
						class="absolute flex flex-col items-center justify-center border-2 transition-all hover:scale-105 hover:shadow-xl {tableShape(table.capacity)} {style.fill} {style.border}"
						style="left: {pos.x}px; top: {pos.y}px;"
						onclick={() => openTableDetails(table)}
					>
						<span class="text-xl font-bold {style.text}">{table.number}</span>
						<div class="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
							<Users size={9} />{table.capacity}
						</div>
						{#if table.label}
							<span class="text-[8px] text-muted-foreground mt-0.5 truncate max-w-full px-1">
								{table.label}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</Card>

		<!-- Table Cards Grid -->
		<div class="grid grid-cols-4 gap-3">
			{#each filteredTables as table (table._id)}
				<Card class="p-4 hover:shadow-md transition-shadow cursor-pointer" onclick={() => openTableDetails(table)}>
					<div class="flex items-center justify-between mb-2">
						<span class="text-lg font-bold">Table {table.number}</span>
						<Badge variant={table.status === 'available' ? 'success' : table.status === 'occupied' ? 'destructive' : table.status === 'reserved' ? 'warning' : 'secondary'}>
							{i18n.t(`status.${table.status}`)}
						</Badge>
					</div>
					<div class="flex items-center gap-1 text-sm text-muted-foreground">
						<Users size={14} /> {table.capacity} seats
					</div>
					{#if table.label}
						<p class="text-xs text-muted-foreground mt-1">{table.label}</p>
					{/if}
					<div class="mt-3 flex gap-2">
						<Button size="sm" variant="outline" class="flex-1" onclick={(e) => { e.stopPropagation(); cycleStatus(table._id, table.status); }}>
							{table.status === 'available' ? 'Seat' : table.status === 'occupied' ? 'Free' : 'Seat'}
						</Button>
						<Button size="sm" variant="ghost" onclick={(e) => { e.stopPropagation(); openTableQr(table._id); }}>
							<QrCode size={14} />
						</Button>
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<!-- Details Panel -->
	{#if selectedTable}
		{@const style = statusStyle[selectedTable.status] ?? statusStyle.available}
		{@const order = getTableOrder(selectedTable)}
		<div class="w-80 border-l bg-card p-6 space-y-5 overflow-y-auto shrink-0">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold">Table {selectedTable.number}</h2>
				<Button size="icon" variant="ghost" onclick={() => (selectedTable = null)}>
					<X size={18} />
				</Button>
			</div>

			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full {style.fill} border {style.border}"></div>
				<span class="text-sm font-medium {style.text}">{i18n.t(`status.${selectedTable.status}`)}</span>
			</div>

			<div class="space-y-2 text-sm">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground">Seats</span>
					<span class="font-medium">{selectedTable.capacity}</span>
				</div>
				{#if selectedTable.qrCode}
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground">QR Code</span>
						<span class="font-mono text-xs">{selectedTable.qrCode}</span>
					</div>
				{/if}
				{#if selectedTable.label}
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground">Label</span>
						<span class="font-medium">{selectedTable.label}</span>
					</div>
				{/if}
			</div>

			{#if order}
				<Card class="p-4 space-y-3">
					<div class="flex items-center gap-2">
						<ShoppingBag size={16} class="text-primary" />
						<span class="text-sm font-semibold">{order.orderNumber ?? 'Current Order'}</span>
						<Badge variant={order.status === 'ready' ? 'success' : order.status === 'preparing' ? 'default' : 'warning'}>
							{order.status}
						</Badge>
					</div>
					<div class="space-y-1">
						{#each (order.items ?? []) as item}
							<div class="flex justify-between text-xs">
								<span>{item.quantity}x {item.name}</span>
								<span class="text-muted-foreground">{formatCurrency(item.totalPrice ?? item.unitPrice * item.quantity)}</span>
							</div>
						{/each}
					</div>
					<div class="flex justify-between border-t pt-2 text-sm font-semibold">
						<span>Total</span>
						<span class="text-primary">{formatCurrency(order.total ?? order.totalAmount ?? 0)}</span>
					</div>
				</Card>
			{:else}
				<div class="text-center py-4 text-sm text-muted-foreground">
					No active order
				</div>
			{/if}

			<div class="space-y-3">
				<h3 class="text-sm font-semibold flex items-center gap-1.5">
					<QrCode size={14} />
					Table QR Code
				</h3>
				<div class="flex justify-center">
					<QrCodeSvg data={tableQrData(selectedTable)} size={180} />
				</div>
				<p class="text-[10px] text-center text-muted-foreground">
					Scan to order from this table
				</p>
			</div>

			<div class="space-y-2">
				<Button variant="outline" class="w-full" onclick={() => cycleStatus(selectedTable!._id, selectedTable!.status)}>
					{selectedTable.status === 'available' ? 'Seat Guests' : selectedTable.status === 'occupied' ? 'Mark Available' : 'Seat Guests'}
				</Button>
				<Button variant="ghost" class="w-full" onclick={() => openTableQr(selectedTable!._id)}>
					<Printer size={14} /> Print QR Tent
				</Button>
			</div>
		</div>
	{/if}
</div>

<Dialog bind:open={showQrDialog}>
	{@const table = data.tables.find((t: any) => t._id === qrTableId)}
	<div class="text-center space-y-4">
		<h2 class="text-xl font-bold">Table {table?.number} QR Code</h2>
		<p class="text-sm text-muted-foreground">Print this QR for the table tent card</p>
		<div id="qr-print-area" class="flex justify-center">
			{#if table}
				<QrCodeSvg data={tableQrData(table)} size={240} />
			{/if}
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
