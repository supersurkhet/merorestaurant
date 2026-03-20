/**
 * Generated Convex API type stubs for the desktop app.
 * These mirror the functions defined in apps/web/convex/.
 * Will be replaced by real generated types once `npx convex dev` runs.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FunctionReference } from 'convex/server';

type QueryRef = FunctionReference<'query', 'public', any, any>;
type MutationRef = FunctionReference<'mutation', 'public', any, any>;

function ref(name: string): any {
	// Runtime function reference - convex client resolves these
	return { _name: name, _type: 'function' } as any;
}

export const api = {
	restaurants: {
		getBySlug: ref('restaurants:getBySlug') as QueryRef,
		getActive: ref('restaurants:getActive') as QueryRef,
		create: ref('restaurants:create') as MutationRef,
		update: ref('restaurants:update') as MutationRef
	},
	categories: {
		listByRestaurant: ref('categories:listByRestaurant') as QueryRef,
		create: ref('categories:create') as MutationRef,
		update: ref('categories:update') as MutationRef,
		remove: ref('categories:remove') as MutationRef
	},
	menus: {
		listByRestaurant: ref('menus:listByRestaurant') as QueryRef,
		getActive: ref('menus:getActive') as QueryRef,
		create: ref('menus:create') as MutationRef,
		update: ref('menus:update') as MutationRef
	},
	menuItems: {
		listByRestaurant: ref('menuItems:listByRestaurant') as QueryRef,
		listByCategory: ref('menuItems:listByCategory') as QueryRef,
		getImageUrl: ref('menuItems:getImageUrl') as QueryRef,
		generateUploadUrl: ref('menuItems:generateUploadUrl') as MutationRef,
		create: ref('menuItems:create') as MutationRef,
		update: ref('menuItems:update') as MutationRef,
		remove: ref('menuItems:remove') as MutationRef,
		toggleAvailability: ref('menuItems:toggleAvailability') as MutationRef
	},
	tables: {
		listByRestaurant: ref('tables:listByRestaurant') as QueryRef,
		getByQrCode: ref('tables:getByQrCode') as QueryRef,
		create: ref('tables:create') as MutationRef,
		update: ref('tables:update') as MutationRef,
		updateStatus: ref('tables:updateStatus') as MutationRef
	},
	orders: {
		getByRestaurant: ref('orders:getByRestaurant') as QueryRef,
		getByTable: ref('orders:getByTable') as QueryRef,
		getByOrderNumber: ref('orders:getByOrderNumber') as QueryRef,
		placeOrder: ref('orders:placeOrder') as MutationRef,
		updateStatus: ref('orders:updateStatus') as MutationRef,
		cancelOrder: ref('orders:cancelOrder') as MutationRef
	},
	orderItems: {
		getByOrder: ref('orderItems:getByOrder') as QueryRef,
		updateStatus: ref('orderItems:updateStatus') as MutationRef
	},
	payments: {
		getByOrder: ref('payments:getByOrder') as QueryRef,
		listByRestaurant: ref('payments:listByRestaurant') as QueryRef,
		createPayment: ref('payments:createPayment') as MutationRef,
		updateStatus: ref('payments:updateStatus') as MutationRef
	},
	staff: {
		listByRestaurant: ref('staff:listByRestaurant') as QueryRef,
		getByWorkosId: ref('staff:getByWorkosId') as QueryRef,
		create: ref('staff:create') as MutationRef,
		update: ref('staff:update') as MutationRef,
		toggleActive: ref('staff:toggleActive') as MutationRef
	},
	wifi: {
		getActiveByRestaurant: ref('wifi:getActiveByRestaurant') as QueryRef,
		update: ref('wifi:update') as MutationRef
	},
	dashboard: {
		getStats: ref('dashboard:getStats') as QueryRef
	},
	analytics: {
		getDailyRevenue: ref('analytics:getDailyRevenue') as QueryRef,
		getPopularItems: ref('analytics:getPopularItems') as QueryRef,
		getOrdersByHour: ref('analytics:getOrdersByHour') as QueryRef,
		getPaymentBreakdown: ref('analytics:getPaymentBreakdown') as QueryRef
	},
	notifications: {
		getUnread: ref('notifications:getUnread') as QueryRef,
		markRead: ref('notifications:markRead') as MutationRef,
		markAllRead: ref('notifications:markAllRead') as MutationRef
	},
	auth: {
		getStaffRoles: ref('auth:getStaffRoles') as QueryRef,
		getAccessibleRestaurants: ref('auth:getAccessibleRestaurants') as QueryRef
	}
} as const;
