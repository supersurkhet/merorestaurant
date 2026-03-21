export const CURRENCY = 'NPR' as const
export const CURRENCY_SYMBOL = 'रु' as const

export const ORDER_STATUSES = [
	'placed',
	'confirmed',
	'preparing',
	'ready',
	'served',
	'cancelled',
] as const

export const PAYMENT_METHODS = ['cash', 'khalti', 'esewa', 'fonepay'] as const

export const STAFF_ROLES = ['owner', 'manager', 'chef', 'waiter', 'cashier'] as const

export const TABLE_STATUSES = ['available', 'occupied', 'reserved'] as const

export const TAX_RATE = 0.13 // 13% VAT in Nepal

/** Format paisa to NPR display string */
export function formatPrice(paisa: number): string {
	const rupees = paisa / 100
	return `${CURRENCY_SYMBOL} ${rupees.toLocaleString('en-NP', { minimumFractionDigits: 2 })}`
}

/** Generate order number: ORD-XXXX */
export function generateOrderNumber(): string {
	const num = Math.floor(1000 + Math.random() * 9000)
	return `ORD-${num}`
}
