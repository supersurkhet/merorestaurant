import { useQuery, useConvexClient, api } from '$lib/convex';
import { getRestaurant } from './restaurant.svelte';
import type { OrderStatus, TableStatus } from '$lib/types';

export function getData() {
	const restaurant = getRestaurant();
	const client = useConvexClient();

	// Reactive queries — skip when restaurantId not yet resolved
	const categoriesQuery = useQuery(
		api.categories.listByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const menuItemsQuery = useQuery(
		api.menuItems.listByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const tablesQuery = useQuery(
		api.tables.listByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const ordersQuery = useQuery(
		api.orders.getByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const staffQuery = useQuery(
		api.staff.listByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const wifiQuery = useQuery(
		api.wifi.getActiveByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const dashboardQuery = useQuery(
		api.dashboard.getStats,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const menusQuery = useQuery(
		api.menus.getActive,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const paymentsQuery = useQuery(
		api.payments.listByRestaurant,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	// Analytics queries
	const dailyRevenueQuery = useQuery(
		api.analytics.getDailyRevenue,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const popularItemsQuery = useQuery(
		api.analytics.getPopularItems,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const ordersByHourQuery = useQuery(
		api.analytics.getOrdersByHour,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	const paymentBreakdownQuery = useQuery(
		api.analytics.getPaymentBreakdown,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	// Notifications
	const notificationsQuery = useQuery(
		api.notifications.getUnread,
		() => (restaurant.id ? { restaurantId: restaurant.id as any } : 'skip')
	);

	return {
		// Data accessors
		get categories() {
			return categoriesQuery.data ?? [];
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
		get staff() {
			return (staffQuery.data ?? []) as any[];
		},
		get wifiConfig() {
			const w = wifiQuery.data;
			if (w) {
				return {
					_id: w._id,
					ssid: w.ssid,
					password: w.password,
					encryption: w.encryptionType,
					updatedAt: (w as any)._creationTime ?? Date.now(),
					qrString: w.qrString
				};
			}
			return {
				_id: '',
				ssid: '',
				password: '',
				encryption: 'WPA2' as const,
				updatedAt: Date.now(),
				qrString: ''
			};
		},
		get dashboardStats() {
			return dashboardQuery.data ?? null;
		},
		get payments() {
			return (paymentsQuery.data ?? []) as any[];
		},
		get activeMenu() {
			return menusQuery.data ?? null;
		},

		// Analytics
		get dailyRevenue() {
			return dailyRevenueQuery.data ?? null;
		},
		get popularItems() {
			return (popularItemsQuery.data ?? []) as any[];
		},
		get ordersByHour() {
			return (ordersByHourQuery.data ?? []) as any[];
		},
		get paymentBreakdown() {
			return (paymentBreakdownQuery.data ?? []) as any[];
		},

		// Notifications
		get notifications() {
			return (notificationsQuery.data ?? []) as any[];
		},
		get unreadNotificationCount() {
			return this.notifications.length;
		},

		// Loading states
		get isLoading() {
			return categoriesQuery.isLoading || ordersQuery.isLoading || tablesQuery.isLoading;
		},

		// Computed
		get activeOrders() {
			return this.orders.filter(
				(o: any) => !['served', 'completed', 'cancelled'].includes(o.status)
			);
		},
		get todayRevenue() {
			const stats = dashboardQuery.data;
			return stats?.totalRevenue ?? 0;
		},
		get availableTableCount() {
			const stats = dashboardQuery.data;
			return stats?.availableTables ?? this.tables.filter((t: any) => t.status === 'available').length;
		},
		get occupiedTableCount() {
			const stats = dashboardQuery.data;
			return stats?.occupiedTables ?? this.tables.filter((t: any) => t.status === 'occupied').length;
		},

		// ===== MUTATIONS =====

		// Order actions
		async updateOrderStatus(orderId: string, status: OrderStatus) {
			await client.mutation(api.orders.updateStatus, {
				id: orderId as any,
				status: status as any
			});
		},

		async cancelOrder(orderId: string) {
			await client.mutation(api.orders.cancelOrder, {
				id: orderId as any
			});
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

		// Table actions
		async updateTableStatus(tableId: string, status: TableStatus, currentOrderId?: string) {
			await client.mutation(api.tables.updateStatus, {
				id: tableId as any,
				status,
				...(currentOrderId ? { currentOrderId: currentOrderId as any } : {})
			} as any);
		},

		async createTable(args: { number: number; label?: string; seats: number; qrCode: string }) {
			if (!restaurant.id) return;
			return await client.mutation(api.tables.create, {
				restaurantId: restaurant.id as any,
				...args
			} as any);
		},

		async updateTable(id: string, updates: { number?: number; label?: string; seats?: number; qrCode?: string }) {
			await client.mutation(api.tables.update, {
				id: id as any,
				...updates
			} as any);
		},

		// Category actions
		async addCategory(args: { name: string; nameNe?: string; sortOrder: number }) {
			if (!restaurant.id) return;
			return await client.mutation(api.categories.create, {
				restaurantId: restaurant.id as any,
				...args
			} as any);
		},

		async updateCategory(id: string, updates: { name?: string; nameNe?: string; sortOrder?: number; isActive?: boolean }) {
			await client.mutation(api.categories.update, {
				id: id as any,
				...updates
			} as any);
		},

		async deleteCategory(id: string) {
			await client.mutation(api.categories.remove, { id: id as any });
		},

		// Menu item actions
		async addMenuItem(args: {
			categoryId: string;
			name: string;
			nameNe?: string;
			description?: string;
			price: number;
			imageStorageId?: string;
			isVeg: boolean;
			sortOrder: number;
		}) {
			if (!restaurant.id) return;
			const menu = this.activeMenu;
			if (!menu) return;
			return await client.mutation(api.menuItems.create, {
				restaurantId: restaurant.id as any,
				menuId: menu._id as any,
				...args
			} as any);
		},

		async updateMenuItem(id: string, updates: {
			name?: string;
			nameNe?: string;
			description?: string;
			price?: number;
			imageStorageId?: string;
			isVeg?: boolean;
			isAvailable?: boolean;
			sortOrder?: number;
			categoryId?: string;
		}) {
			await client.mutation(api.menuItems.update, {
				id: id as any,
				...updates
			} as any);
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

		// Staff actions
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
			await client.mutation(api.staff.update, {
				id: id as any,
				...updates
			} as any);
		},

		async toggleStaffActive(id: string) {
			await client.mutation(api.staff.toggleActive, { id: id as any });
		},

		// WiFi actions
		async updateWifi(ssid: string, password: string, encryptionType: string) {
			if (!restaurant.id) return;
			await client.mutation(api.wifi.update, {
				restaurantId: restaurant.id as any,
				ssid,
				password,
				encryptionType: encryptionType as any,
				updatedBy: 'admin'
			} as any);
		},

		// Notification actions
		async markNotificationRead(id: string) {
			await client.mutation(api.notifications.markRead, { id: id as any });
		},

		async markAllNotificationsRead() {
			if (!restaurant.id) return;
			await client.mutation(api.notifications.markAllRead, {
				restaurantId: restaurant.id as any
			});
		},

		// Payment actions
		async createPayment(args: {
			orderId: string;
			method: string;
			amount: number;
			externalRef?: string;
			processedBy?: string;
		}) {
			if (!restaurant.id) return;
			return await client.mutation(api.payments.createPayment, {
				restaurantId: restaurant.id as any,
				...args
			} as any);
		}
	};
}
