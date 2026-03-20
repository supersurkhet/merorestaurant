export interface CartItem {
	menuItemId: string;
	name: string;
	nameNe: string;
	price: number;
	quantity: number;
}

class CartStore {
	items = $state<CartItem[]>([]);

	total = $derived(this.items.reduce((sum, item) => sum + item.price * item.quantity, 0));

	totalWithVat = $derived(Math.round(this.total * 1.13));

	vatAmount = $derived(this.totalWithVat - this.total);

	itemCount = $derived(this.items.reduce((sum, item) => sum + item.quantity, 0));

	addItem(menuItemId: string, name: string, nameNe: string, price: number) {
		const existing = this.items.find((i) => i.menuItemId === menuItemId);
		if (existing) {
			existing.quantity += 1;
		} else {
			this.items.push({ menuItemId, name, nameNe, price, quantity: 1 });
		}
	}

	removeItem(menuItemId: string) {
		this.items = this.items.filter((i) => i.menuItemId !== menuItemId);
	}

	updateQuantity(menuItemId: string, quantity: number) {
		if (quantity <= 0) {
			this.removeItem(menuItemId);
			return;
		}
		const item = this.items.find((i) => i.menuItemId === menuItemId);
		if (item) {
			item.quantity = quantity;
		}
	}

	clearCart() {
		this.items = [];
	}
}

export const cart = new CartStore();
