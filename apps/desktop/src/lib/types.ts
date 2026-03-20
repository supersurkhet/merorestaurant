export type Role = 'admin' | 'manager' | 'kitchen_staff' | 'waiter';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export type PaymentMethod = 'cash' | 'khalti' | 'esewa' | 'fonepay';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Restaurant {
	_id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	openingHours: string;
	closingHours: string;
}

export interface Category {
	_id: string;
	name: string;
	nameNe: string;
	description?: string;
	sortOrder: number;
	isActive: boolean;
}

export interface MenuItem {
	_id: string;
	categoryId: string;
	name: string;
	nameNe: string;
	description?: string;
	descriptionNe?: string;
	price: number;
	imageUrl?: string;
	isAvailable: boolean;
	isVeg: boolean;
	preparationTime: number;
	sortOrder: number;
}

export interface Table {
	_id: string;
	number: number;
	seats: number;
	status: TableStatus;
	x: number;
	y: number;
	currentOrderId?: string;
	reservedBy?: string;
	reservedAt?: number;
}

export interface Order {
	_id: string;
	tableId?: string;
	tableNumber?: number;
	items: OrderItem[];
	status: OrderStatus;
	totalAmount: number;
	paymentMethod?: PaymentMethod;
	paymentStatus: PaymentStatus;
	notes?: string;
	createdAt: number;
	updatedAt: number;
	preparedAt?: number;
	servedAt?: number;
	staffId?: string;
}

export interface OrderItem {
	menuItemId: string;
	name: string;
	quantity: number;
	price: number;
	notes?: string;
}

export interface Staff {
	_id: string;
	name: string;
	email: string;
	role: Role;
	isActive: boolean;
	workosUserId?: string;
	avatarUrl?: string;
	phone?: string;
	joinedAt: number;
}

export interface WifiConfig {
	_id: string;
	ssid: string;
	password: string;
	encryption: 'WPA' | 'WPA2' | 'WEP' | 'nopass';
	updatedAt: number;
}

export interface DailyStats {
	date: string;
	totalOrders: number;
	totalRevenue: number;
	avgOrderValue: number;
	popularItems: { name: string; count: number }[];
	ordersByHour: { hour: number; count: number }[];
}
