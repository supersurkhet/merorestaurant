/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FunctionReference } from 'convex/server';

type Q = FunctionReference<'query', 'public', any, any>;
type M = FunctionReference<'mutation', 'public', any, any>;

function ref(name: string): any {
	return { _name: name, _type: 'function' } as any;
}

export const api = {
	restaurants: {
		getBySlug: ref('restaurants:getBySlug') as Q,
		getActive: ref('restaurants:getActive') as Q,
		get: ref('restaurants:get') as Q,
		register: ref('restaurants:register') as M,
		create: ref('restaurants:create') as M,
		update: ref('restaurants:update') as M,
		advanceOnboarding: ref('restaurants:advanceOnboarding') as M,
		updateSubscription: ref('restaurants:updateSubscription') as M
	},
	categories: {
		listByRestaurant: ref('categories:listByRestaurant') as Q,
		listActiveByRestaurant: ref('categories:listActiveByRestaurant') as Q,
		create: ref('categories:create') as M,
		update: ref('categories:update') as M,
		remove: ref('categories:remove') as M
	},
	menuItems: {
		listByRestaurant: ref('menuItems:listByRestaurant') as Q,
		listByCategory: ref('menuItems:listByCategory') as Q,
		get: ref('menuItems:get') as Q,
		getImageUrl: ref('menuItems:getImageUrl') as Q,
		generateUploadUrl: ref('menuItems:generateUploadUrl') as M,
		create: ref('menuItems:create') as M,
		update: ref('menuItems:update') as M,
		remove: ref('menuItems:remove') as M,
		toggleAvailability: ref('menuItems:toggleAvailability') as M
	},
	tables: {
		listByRestaurant: ref('tables:listByRestaurant') as Q,
		getByQrCode: ref('tables:getByQrCode') as Q,
		get: ref('tables:get') as Q,
		create: ref('tables:create') as M,
		update: ref('tables:update') as M,
		updateStatus: ref('tables:updateStatus') as M,
		remove: ref('tables:remove') as M
	},
	orders: {
		getByRestaurant: ref('orders:getByRestaurant') as Q,
		getActiveByRestaurant: ref('orders:getActiveByRestaurant') as Q,
		getByTable: ref('orders:getByTable') as Q,
		getByOrderNumber: ref('orders:getByOrderNumber') as Q,
		get: ref('orders:get') as Q,
		placeOrder: ref('orders:placeOrder') as M,
		updateStatus: ref('orders:updateStatus') as M,
		cancelOrder: ref('orders:cancelOrder') as M
	},
	orderItems: {
		getByOrder: ref('orderItems:getByOrder') as Q,
		updateStatus: ref('orderItems:updateStatus') as M
	},
	payments: {
		getByOrder: ref('payments:getByOrder') as Q,
		listByRestaurant: ref('payments:listByRestaurant') as Q,
		createPayment: ref('payments:createPayment') as M,
		updateStatus: ref('payments:updateStatus') as M,
		verifyKhalti: ref('payments:verifyKhalti') as M
	},
	staff: {
		listByRestaurant: ref('staff:listByRestaurant') as Q,
		getByWorkosId: ref('staff:getByWorkosId') as Q,
		create: ref('staff:create') as M,
		update: ref('staff:update') as M,
		toggleActive: ref('staff:toggleActive') as M,
		remove: ref('staff:remove') as M
	},
	wifiConfigs: {
		getActiveByRestaurant: ref('wifiConfigs:getActiveByRestaurant') as Q,
		getByRestaurant: ref('wifiConfigs:getByRestaurant') as Q,
		update: ref('wifiConfigs:update') as M
	},
	analytics: {
		getDailyRevenue: ref('analytics:getDailyRevenue') as Q,
		getPopularItems: ref('analytics:getPopularItems') as Q,
		getOrdersByHour: ref('analytics:getOrdersByHour') as Q,
		getPaymentBreakdown: ref('analytics:getPaymentBreakdown') as Q
	},
	auth: {
		loginOrSignup: ref('auth:loginOrSignup') as M,
		currentUser: ref('auth:currentUser') as Q,
		checkRole: ref('auth:checkRole') as Q
	}
} as const;
