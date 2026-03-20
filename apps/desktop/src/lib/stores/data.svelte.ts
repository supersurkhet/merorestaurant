import type {
	Order,
	Table,
	Category,
	MenuItem,
	Staff,
	WifiConfig,
	OrderStatus,
	TableStatus
} from '$lib/types';

// Mock data for development - will be replaced by Convex subscriptions
const mockCategories: Category[] = [
	{ _id: 'c1', name: 'Appetizers', nameNe: 'स्टार्टर', sortOrder: 1, isActive: true },
	{ _id: 'c2', name: 'Main Course', nameNe: 'मुख्य खाना', sortOrder: 2, isActive: true },
	{ _id: 'c3', name: 'Dal & Rice', nameNe: 'दाल भात', sortOrder: 3, isActive: true },
	{ _id: 'c4', name: 'Momo', nameNe: 'मोमो', sortOrder: 4, isActive: true },
	{ _id: 'c5', name: 'Beverages', nameNe: 'पेय', sortOrder: 5, isActive: true },
	{ _id: 'c6', name: 'Desserts', nameNe: 'मिठाई', sortOrder: 6, isActive: true }
];

const mockMenuItems: MenuItem[] = [
	{
		_id: 'm1',
		categoryId: 'c4',
		name: 'Chicken Momo (Steam)',
		nameNe: 'चिकन मोमो (स्टीम)',
		description: 'Steamed chicken dumplings with spicy tomato chutney',
		price: 220,
		isAvailable: true,
		isVeg: false,
		preparationTime: 20,
		sortOrder: 1
	},
	{
		_id: 'm2',
		categoryId: 'c4',
		name: 'Buff Momo (Fried)',
		nameNe: 'बफ मोमो (फ्राइड)',
		description: 'Fried buffalo dumplings with spicy sauce',
		price: 250,
		isAvailable: true,
		isVeg: false,
		preparationTime: 25,
		sortOrder: 2
	},
	{
		_id: 'm3',
		categoryId: 'c4',
		name: 'Veg Momo (Steam)',
		nameNe: 'भेज मोमो (स्टीम)',
		description: 'Steamed vegetable dumplings',
		price: 180,
		isAvailable: true,
		isVeg: true,
		preparationTime: 20,
		sortOrder: 3
	},
	{
		_id: 'm4',
		categoryId: 'c3',
		name: 'Dal Bhat Set',
		nameNe: 'दाल भात सेट',
		description: 'Traditional Nepali thali with rice, dal, vegetables, pickle, and papad',
		price: 350,
		isAvailable: true,
		isVeg: true,
		preparationTime: 15,
		sortOrder: 1
	},
	{
		_id: 'm5',
		categoryId: 'c3',
		name: 'Chicken Dal Bhat',
		nameNe: 'चिकन दाल भात',
		description: 'Dal Bhat with chicken curry',
		price: 450,
		isAvailable: true,
		isVeg: false,
		preparationTime: 20,
		sortOrder: 2
	},
	{
		_id: 'm6',
		categoryId: 'c2',
		name: 'Chicken Chowmein',
		nameNe: 'चिकन चाउमिन',
		description: 'Stir-fried noodles with chicken and vegetables',
		price: 280,
		isAvailable: true,
		isVeg: false,
		preparationTime: 15,
		sortOrder: 1
	},
	{
		_id: 'm7',
		categoryId: 'c2',
		name: 'Chicken Sekuwa',
		nameNe: 'चिकन सेकुवा',
		description: 'Grilled spiced chicken',
		price: 380,
		isAvailable: true,
		isVeg: false,
		preparationTime: 30,
		sortOrder: 2
	},
	{
		_id: 'm8',
		categoryId: 'c5',
		name: 'Masala Tea',
		nameNe: 'मसला चिया',
		description: 'Spiced milk tea',
		price: 50,
		isAvailable: true,
		isVeg: true,
		preparationTime: 5,
		sortOrder: 1
	},
	{
		_id: 'm9',
		categoryId: 'c5',
		name: 'Fresh Lemon Soda',
		nameNe: 'ताजा लेमन सोडा',
		description: 'Fresh squeezed lemon with soda',
		price: 80,
		isAvailable: true,
		isVeg: true,
		preparationTime: 3,
		sortOrder: 2
	},
	{
		_id: 'm10',
		categoryId: 'c1',
		name: 'Papadam',
		nameNe: 'पापड',
		description: 'Crispy lentil crackers with chutney',
		price: 60,
		isAvailable: true,
		isVeg: true,
		preparationTime: 5,
		sortOrder: 1
	},
	{
		_id: 'm11',
		categoryId: 'c6',
		name: 'Jalebi',
		nameNe: 'जलेबी',
		description: 'Sweet fried spirals soaked in sugar syrup',
		price: 120,
		isAvailable: true,
		isVeg: true,
		preparationTime: 10,
		sortOrder: 1
	}
];

const mockTables: Table[] = [
	{ _id: 't1', number: 1, seats: 2, status: 'available', x: 50, y: 50 },
	{ _id: 't2', number: 2, seats: 4, status: 'occupied', x: 200, y: 50, currentOrderId: 'o1' },
	{ _id: 't3', number: 3, seats: 4, status: 'available', x: 350, y: 50 },
	{ _id: 't4', number: 4, seats: 6, status: 'reserved', x: 50, y: 200, reservedBy: 'Ram Sharma' },
	{ _id: 't5', number: 5, seats: 2, status: 'occupied', x: 200, y: 200, currentOrderId: 'o2' },
	{ _id: 't6', number: 6, seats: 8, status: 'available', x: 350, y: 200 },
	{ _id: 't7', number: 7, seats: 4, status: 'cleaning', x: 50, y: 350 },
	{ _id: 't8', number: 8, seats: 4, status: 'occupied', x: 200, y: 350, currentOrderId: 'o3' },
	{ _id: 't9', number: 9, seats: 6, status: 'available', x: 350, y: 350 },
	{ _id: 't10', number: 10, seats: 2, status: 'available', x: 500, y: 50 },
	{ _id: 't11', number: 11, seats: 4, status: 'available', x: 500, y: 200 },
	{ _id: 't12', number: 12, seats: 8, status: 'reserved', x: 500, y: 350, reservedBy: 'Sita Thapa' }
];

const now = Date.now();

const mockOrders: Order[] = [
	{
		_id: 'o1',
		tableId: 't2',
		tableNumber: 2,
		items: [
			{ menuItemId: 'm1', name: 'Chicken Momo (Steam)', quantity: 2, price: 220 },
			{ menuItemId: 'm8', name: 'Masala Tea', quantity: 2, price: 50 }
		],
		status: 'preparing',
		totalAmount: 540,
		paymentStatus: 'pending',
		createdAt: now - 900_000,
		updatedAt: now - 600_000
	},
	{
		_id: 'o2',
		tableId: 't5',
		tableNumber: 5,
		items: [
			{ menuItemId: 'm4', name: 'Dal Bhat Set', quantity: 1, price: 350 },
			{ menuItemId: 'm9', name: 'Fresh Lemon Soda', quantity: 1, price: 80 }
		],
		status: 'confirmed',
		totalAmount: 430,
		paymentStatus: 'pending',
		createdAt: now - 300_000,
		updatedAt: now - 300_000
	},
	{
		_id: 'o3',
		tableId: 't8',
		tableNumber: 8,
		items: [
			{ menuItemId: 'm5', name: 'Chicken Dal Bhat', quantity: 2, price: 450 },
			{ menuItemId: 'm7', name: 'Chicken Sekuwa', quantity: 1, price: 380 },
			{ menuItemId: 'm8', name: 'Masala Tea', quantity: 3, price: 50 }
		],
		status: 'ready',
		totalAmount: 1430,
		paymentStatus: 'pending',
		createdAt: now - 1_800_000,
		updatedAt: now - 120_000,
		preparedAt: now - 120_000
	},
	{
		_id: 'o4',
		tableId: 't2',
		tableNumber: 2,
		items: [
			{ menuItemId: 'm6', name: 'Chicken Chowmein', quantity: 1, price: 280 },
			{ menuItemId: 'm10', name: 'Papadam', quantity: 1, price: 60 }
		],
		status: 'pending',
		totalAmount: 340,
		paymentStatus: 'pending',
		createdAt: now - 60_000,
		updatedAt: now - 60_000
	},
	{
		_id: 'o5',
		items: [
			{ menuItemId: 'm2', name: 'Buff Momo (Fried)', quantity: 3, price: 250 },
			{ menuItemId: 'm11', name: 'Jalebi', quantity: 2, price: 120 }
		],
		status: 'preparing',
		totalAmount: 990,
		paymentStatus: 'pending',
		notes: 'Takeaway order - extra chutney',
		createdAt: now - 480_000,
		updatedAt: now - 360_000
	}
];

const mockStaff: Staff[] = [
	{
		_id: 's1',
		name: 'Rajesh Sharma',
		email: 'rajesh@merorestaurant.com',
		role: 'admin',
		isActive: true,
		phone: '9858012345',
		joinedAt: now - 86400_000 * 365
	},
	{
		_id: 's2',
		name: 'Suman Thapa',
		email: 'suman@merorestaurant.com',
		role: 'manager',
		isActive: true,
		phone: '9858023456',
		joinedAt: now - 86400_000 * 180
	},
	{
		_id: 's3',
		name: 'Kumar Bhandari',
		email: 'kumar@merorestaurant.com',
		role: 'kitchen_staff',
		isActive: true,
		phone: '9858034567',
		joinedAt: now - 86400_000 * 90
	},
	{
		_id: 's4',
		name: 'Anita Rana',
		email: 'anita@merorestaurant.com',
		role: 'waiter',
		isActive: true,
		phone: '9858045678',
		joinedAt: now - 86400_000 * 60
	},
	{
		_id: 's5',
		name: 'Bikram KC',
		email: 'bikram@merorestaurant.com',
		role: 'waiter',
		isActive: false,
		phone: '9858056789',
		joinedAt: now - 86400_000 * 30
	}
];

const mockWifiConfig: WifiConfig = {
	_id: 'w1',
	ssid: 'MeroRestaurant_Surkhet',
	password: 'namaste2024',
	encryption: 'WPA2',
	updatedAt: now - 86400_000 * 7
};

// Reactive stores
let categories = $state<Category[]>(mockCategories);
let menuItems = $state<MenuItem[]>(mockMenuItems);
let tables = $state<Table[]>(mockTables);
let orders = $state<Order[]>(mockOrders);
let staff = $state<Staff[]>(mockStaff);
let wifiConfig = $state<WifiConfig>(mockWifiConfig);

export function getData() {
	return {
		get categories() {
			return categories;
		},
		get menuItems() {
			return menuItems;
		},
		get tables() {
			return tables;
		},
		get orders() {
			return orders;
		},
		get staff() {
			return staff;
		},
		get wifiConfig() {
			return wifiConfig;
		},

		// Order actions
		updateOrderStatus(orderId: string, status: OrderStatus) {
			const order = orders.find((o) => o._id === orderId);
			if (order) {
				order.status = status;
				order.updatedAt = Date.now();
				if (status === 'ready') order.preparedAt = Date.now();
				if (status === 'served') order.servedAt = Date.now();
			}
		},

		// Table actions
		updateTableStatus(tableId: string, status: TableStatus) {
			const table = tables.find((t) => t._id === tableId);
			if (table) {
				table.status = status;
				if (status === 'available') {
					table.currentOrderId = undefined;
					table.reservedBy = undefined;
				}
			}
		},

		// Menu actions
		addCategory(category: Category) {
			categories = [...categories, category];
		},
		updateCategory(id: string, updates: Partial<Category>) {
			const cat = categories.find((c) => c._id === id);
			if (cat) Object.assign(cat, updates);
		},
		deleteCategory(id: string) {
			categories = categories.filter((c) => c._id !== id);
		},
		addMenuItem(item: MenuItem) {
			menuItems = [...menuItems, item];
		},
		updateMenuItem(id: string, updates: Partial<MenuItem>) {
			const item = menuItems.find((m) => m._id === id);
			if (item) Object.assign(item, updates);
		},
		deleteMenuItem(id: string) {
			menuItems = menuItems.filter((m) => m._id !== id);
		},
		toggleMenuItemAvailability(id: string) {
			const item = menuItems.find((m) => m._id === id);
			if (item) item.isAvailable = !item.isAvailable;
		},

		// Staff actions
		addStaff(member: Staff) {
			staff = [...staff, member];
		},
		updateStaff(id: string, updates: Partial<Staff>) {
			const member = staff.find((s) => s._id === id);
			if (member) Object.assign(member, updates);
		},
		toggleStaffActive(id: string) {
			const member = staff.find((s) => s._id === id);
			if (member) member.isActive = !member.isActive;
		},

		// WiFi actions
		updateWifi(ssid: string, password: string, encryption: WifiConfig['encryption']) {
			wifiConfig = { ...wifiConfig, ssid, password, encryption, updatedAt: Date.now() };
		},

		// Stats
		get activeOrders() {
			return orders.filter((o) => !['served', 'cancelled'].includes(o.status));
		},
		get todayRevenue() {
			return orders
				.filter((o) => o.status === 'served')
				.reduce((sum, o) => sum + o.totalAmount, 0);
		},
		get availableTableCount() {
			return tables.filter((t) => t.status === 'available').length;
		},
		get occupiedTableCount() {
			return tables.filter((t) => t.status === 'occupied').length;
		}
	};
}
