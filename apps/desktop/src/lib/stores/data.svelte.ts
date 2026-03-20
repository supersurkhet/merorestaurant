import { useQuery, useConvexClient, api } from '$lib/convex';
import { getRestaurant } from './restaurant.svelte';

// Root convex uses: placed/confirmed/preparing/ready/served/cancelled
type ConvexOrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
type ConvexTableStatus = 'available' | 'occupied' | 'reserved';

export function getData() {
	const restaurant = getRestaurant();
	const client = useConvexClient();

	const rid = () => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip' as const);

	// Core data queries
	const categoriesQuery = useQuery(api.categories.listByRestaurant, rid);
	const menuItemsQuery = useQuery(api.menuItems.listByRestaurant, rid);
	const tablesQuery = useQuery(api.tables.listByRestaurant, rid);
	const ordersQuery = useQuery(api.orders.getByRestaurant, rid);
	const activeOrdersQuery = useQuery(api.orders.getActiveByRestaurant, rid);
	const staffQuery = useQuery(api.staff.listByRestaurant, rid);
	const wifiQuery = useQuery(api.wifiConfigs.getActiveByRestaurant, rid);
	const paymentsQuery = useQuery(api.payments.listByRestaurant, rid);

	return {
		// Data accessors
		get categories() {
			return (categoriesQuery.data ?? []) as any[];
		},
		get menuItems() {
			return (menuItemsQuery.data ?? []) as any[];
		},
		get tables() {
			return (tablesQuery.data ?? []) as any[];
		},
		get orders() {
			return (ordersQuery.data ?? []) as any[];
		},
		get activeOrders() {
			return (activeOrdersQuery.data ?? []) as any[];
		},
		get staff() {
			return (staffQuery.data ?? []) as any[];
		},
		get wifiConfig() {
			const w = wifiQuery.data as any;
			if (w) {
				return {
					_id: w._id,
					ssid: w.ssid,
					password: w.password,
					encryption: w.encryptionType,
					updatedAt: w.updatedAt ?? w._creationTime ?? Date.now(),
					qrString: w.qrString ?? ''
				};
			}
			return { _id: '', ssid: '', password: '', encryption: 'WPA2', updatedAt: Date.now(), qrString: '' };
		},
		get payments() {
			return (paymentsQuery.data ?? []) as any[];
		},

		// Dashboard stats (computed from data)
		get dashboardStats() {
			return {
				totalRevenue: this.todayRevenue,
				completedOrderCount: this.orders.filter((o: any) => o.status === 'served').length,
				totalTables: this.tables.length,
				occupiedTables: this.occupiedTableCount,
				availableTables: this.availableTableCount,
				activeOrderCount: this.activeOrders.length
			};
		},

		// Analytics computed from order/payment data
		get popularItems(): any[] {
			const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
			for (const order of this.orders) {
				for (const item of (order.items ?? [])) {
					const existing = itemMap.get(item.name) ?? { name: item.name, count: 0, revenue: 0 };
					existing.count += item.quantity ?? 1;
					existing.revenue += item.price ?? item.totalPrice ?? 0;
					itemMap.set(item.name, existing);
				}
			}
			return [...itemMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);
		},
		get ordersByHour(): any[] {
			const hours = Array.from({ length: 14 }, (_, i) => ({
				hour: `${(i + 8) % 12 || 12}${i + 8 < 12 ? 'AM' : 'PM'}`,
				count: 0
			}));
			for (const order of this.orders) {
				const t = order._creationTime ?? order.placedAt ?? Date.now();
				const h = new Date(t).getHours();
				if (h >= 8 && h <= 21) hours[h - 8].count++;
			}
			return hours;
		},
		get paymentBreakdown(): any[] {
			const byMethod = new Map<string, number>();
			let total = 0;
			for (const p of this.payments.filter((p: any) => p.status === 'completed')) {
				byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount);
				total += p.amount;
			}
			if (total === 0) return [];
			return [...byMethod.entries()].map(([method, amount]) => ({
				method, amount, percent: Math.round((amount / total) * 100)
			})).sort((a, b) => b.amount - a.amount);
		},
		get dailyRevenue() {
			return { totalRevenue: this.todayRevenue };
		},

		// Loading states
		get isLoading() {
			return categoriesQuery.isLoading || ordersQuery.isLoading || tablesQuery.isLoading;
		},

		// Computed stats
		get todayRevenue() {
			return this.payments
				.filter((p: any) => p.status === 'completed')
				.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);
		},
		get availableTableCount() {
			return this.tables.filter((t: any) => t.status === 'available').length;
		},
		get occupiedTableCount() {
			return this.tables.filter((t: any) => t.status === 'occupied').length;
		},

		// ===== MUTATIONS =====

		// Orders
		async updateOrderStatus(orderId: string, status: ConvexOrderStatus) {
			await client.mutation(api.orders.updateStatus, { id: orderId as any, status } as any);
		},
		async cancelOrder(orderId: string) {
			await client.mutation(api.orders.cancelOrder, { id: orderId as any });
		},
		async placeOrder(args: {
			tableId?: string;
			items: { menuItemId: string; quantity: number; notes?: string }[];
			customerName?: string;
			customerPhone?: string;
			notes?: string;
		}) {
			if (!restaurant.id) return;
			return await client.mutation(api.orders.placeOrder, {
				restaurantId: restaurant.id as any,
				...args
			} as any);
		},

		// Tables — root uses 'capacity' not 'seats'
		async updateTableStatus(tableId: string, status: ConvexTableStatus) {
			await client.mutation(api.tables.updateStatus, { id: tableId as any, status } as any);
		},
		async createTable(args: { number: number; label?: string; capacity: number }) {
			if (!restaurant.id) return;
			return await client.mutation(api.tables.create, {
				restaurantId: restaurant.id as any,
				...args
			} as any);
		},
		async updateTable(id: string, updates: { number?: number; label?: string; capacity?: number }) {
			await client.mutation(api.tables.update, { id: id as any, ...updates } as any);
		},
		async removeTable(id: string) {
			await client.mutation(api.tables.remove, { id: id as any });
		},

		// Categories
		async addCategory(args: { name: string; nameNe: string; description?: string; sortOrder: number }) {
			if (!restaurant.id) return;
			return await client.mutation(api.categories.create, {
				restaurantId: restaurant.id as any, ...args
			} as any);
		},
		async updateCategory(id: string, updates: { name?: string; nameNe?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
			await client.mutation(api.categories.update, { id: id as any, ...updates } as any);
		},
		async deleteCategory(id: string) {
			await client.mutation(api.categories.remove, { id: id as any });
		},

		// Menu items — root uses 'image' not 'imageStorageId', no menuId, has isSpicy/preparationTime
		async addMenuItem(args: {
			categoryId: string;
			name: string;
			nameNe?: string;
			description?: string;
			descriptionNe?: string;
			price: number;
			image?: string;
			isVeg: boolean;
			isSpicy?: boolean;
			preparationTime?: number;
			sortOrder: number;
		}) {
			if (!restaurant.id) return;
			return await client.mutation(api.menuItems.create, {
				restaurantId: restaurant.id as any, ...args
			} as any);
		},
		async updateMenuItem(id: string, updates: {
			name?: string;
			nameNe?: string;
			description?: string;
			descriptionNe?: string;
			price?: number;
			image?: string;
			isVeg?: boolean;
			isSpicy?: boolean;
			isAvailable?: boolean;
			preparationTime?: number;
			sortOrder?: number;
			categoryId?: string;
		}) {
			await client.mutation(api.menuItems.update, { id: id as any, ...updates } as any);
		},
		async deleteMenuItem(id: string) {
			await client.mutation(api.menuItems.remove, { id: id as any });
		},
		async toggleMenuItemAvailability(id: string) {
			await client.mutation(api.menuItems.toggleAvailability, { id: id as any });
		},
		async generateUploadUrl() {
			return await client.mutation(api.menuItems.generateUploadUrl, {});
		},

		// Staff — root uses 'chef' not 'kitchen'
		async addStaff(args: { name: string; email: string; role: string; workosUserId?: string }) {
			if (!restaurant.id) return;
			return await client.mutation(api.staff.create, {
				restaurantId: restaurant.id as any,
				workosUserId: args.workosUserId ?? `temp-${Date.now()}`,
				name: args.name,
				email: args.email,
				role: args.role as any
			} as any);
		},
		async updateStaff(id: string, updates: { name?: string; email?: string; role?: string }) {
			await client.mutation(api.staff.update, { id: id as any, ...updates } as any);
		},
		async toggleStaffActive(id: string) {
			await client.mutation(api.staff.toggleActive, { id: id as any });
		},
		async removeStaff(id: string) {
			await client.mutation(api.staff.remove, { id: id as any });
		},

		// WiFi — module is 'wifiConfigs' not 'wifi', no 'updatedBy' arg
		async updateWifi(ssid: string, password: string, encryptionType: string) {
			if (!restaurant.id) return;
			await client.mutation(api.wifiConfigs.update, {
				restaurantId: restaurant.id as any,
				ssid,
				password,
				encryptionType: encryptionType as any
			} as any);
		},

		// Payments — root uses 'transactionId' not 'externalRef'
		async createPayment(args: {
			orderId: string;
			method: string;
			amount: number;
			transactionId?: string;
		}) {
			if (!restaurant.id) return;
			return await client.mutation(api.payments.createPayment, {
				restaurantId: restaurant.id as any,
				orderId: args.orderId as any,
				method: args.method as any,
				amount: args.amount
			} as any);
		},
		async updatePaymentStatus(id: string, status: string, transactionId?: string) {
			await client.mutation(api.payments.updateStatus, {
				id: id as any,
				status: status as any,
				...(transactionId ? { transactionId } : {})
			} as any);
		}
	};
}
