<script lang="ts">
	import { t, locale } from '$i18n';
	import { cart } from '$lib/stores/cart.svelte';
	import { goto } from '$app/navigation';
	import {
		ShoppingCart,
		Plus,
		Minus,
		Trash2,
		ArrowLeft,
		Receipt,
		User,
		MessageSquare,
		ArrowRight
	} from 'lucide-svelte';

	let customerName = $state('');
	let notes = $state('');
	let isPlacing = $state(false);

	async function placeOrder() {
		if (cart.items.length === 0) return;
		isPlacing = true;

		try {
			// TODO: Call Convex placeOrder mutation when ready
			// const orderId = await convexClient.mutation(api.orders.placeOrder, {
			//   items: cart.items.map(i => ({
			//     menuItemId: i.menuItemId,
			//     name: i.name,
			//     price: i.price,
			//     quantity: i.quantity,
			//   })),
			//   customerName: customerName || undefined,
			//   notes: notes || undefined,
			//   subtotal: cart.total,
			//   vat: cart.vatAmount,
			//   total: cart.totalWithVat,
			// });

			// Stub: generate a temporary order number
			const orderNumber = `MR-${Date.now().toString(36).toUpperCase()}`;

			cart.clearCart();
			goto(`/order/${orderNumber}`);
		} catch (err) {
			console.error('Failed to place order:', err);
			isPlacing = false;
		}
	}
</script>

<svelte:head>
	<title>Your Order — {$t('site.name')}</title>
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<a
			href="/menu"
			class="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Menu
		</a>
		<h1 class="font-[var(--font-display)] text-4xl font-bold text-white">
			Your Order
		</h1>
	</div>
</section>

<section class="bg-background py-12">
	<div class="mx-auto max-w-4xl px-4 sm:px-6">
		{#if cart.items.length === 0}
			<!-- Empty cart -->
			<div class="rounded-2xl border border-border bg-card py-20 text-center">
				<ShoppingCart class="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
				<h2 class="text-xl font-semibold text-foreground">Your cart is empty</h2>
				<p class="mt-2 text-muted-foreground">
					Add some delicious items from our menu
				</p>
				<a
					href="/menu"
					class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
				>
					Browse Menu
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
		{:else}
			<div class="grid gap-8 lg:grid-cols-5">
				<!-- Cart Items -->
				<div class="lg:col-span-3">
					<div class="rounded-2xl border border-border bg-card">
						<div class="border-b border-border p-6">
							<h2 class="flex items-center gap-2 text-lg font-semibold text-foreground">
								<ShoppingCart class="h-5 w-5 text-primary" />
								Cart ({cart.itemCount} items)
							</h2>
						</div>

						<div class="divide-y divide-border">
							{#each cart.items as item (item.menuItemId)}
								<div class="flex items-center gap-4 p-6">
									<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20">
										<span class="text-2xl">🍛</span>
									</div>

									<div class="min-w-0 flex-1">
										<h3 class="font-medium text-foreground">
											{$locale === 'ne' ? item.nameNe : item.name}
										</h3>
										<p class="text-sm text-muted-foreground">
											Rs. {item.price} each
										</p>
									</div>

									<div class="flex items-center gap-2">
										<button
											class="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
											onclick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)}
										>
											<Minus class="h-3.5 w-3.5" />
										</button>
										<span class="w-8 text-center text-sm font-semibold text-foreground">
											{item.quantity}
										</span>
										<button
											class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
											onclick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)}
										>
											<Plus class="h-3.5 w-3.5" />
										</button>
									</div>

									<div class="w-20 text-right">
										<p class="font-semibold text-foreground">
											Rs. {item.price * item.quantity}
										</p>
									</div>

									<button
										class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
										onclick={() => cart.removeItem(item.menuItemId)}
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							{/each}
						</div>
					</div>

					<!-- Customer Info -->
					<div class="mt-6 rounded-2xl border border-border bg-card p-6">
						<h3 class="mb-4 text-sm font-semibold tracking-wider text-foreground uppercase">
							Order Details
						</h3>
						<div class="space-y-4">
							<div>
								<label for="name" class="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
									<User class="h-4 w-4 text-muted-foreground" />
									Name (optional)
								</label>
								<input
									id="name"
									type="text"
									bind:value={customerName}
									placeholder="Your name"
									class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
								/>
							</div>
							<div>
								<label for="notes" class="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
									<MessageSquare class="h-4 w-4 text-muted-foreground" />
									Special Instructions
								</label>
								<textarea
									id="notes"
									bind:value={notes}
									placeholder="Any allergies, preferences, or special requests..."
									rows="3"
									class="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
								></textarea>
							</div>
						</div>
					</div>
				</div>

				<!-- Order Summary -->
				<div class="lg:col-span-2">
					<div class="sticky top-28 rounded-2xl border border-border bg-card">
						<div class="border-b border-border p-6">
							<h2 class="flex items-center gap-2 text-lg font-semibold text-foreground">
								<Receipt class="h-5 w-5 text-primary" />
								Order Summary
							</h2>
						</div>
						<div class="p-6">
							<div class="space-y-3 text-sm">
								<div class="flex justify-between text-muted-foreground">
									<span>Subtotal</span>
									<span>Rs. {cart.total}</span>
								</div>
								<div class="flex justify-between text-muted-foreground">
									<span>VAT (13%)</span>
									<span>Rs. {cart.vatAmount}</span>
								</div>
								<div class="border-t border-border pt-3">
									<div class="flex justify-between text-lg font-bold text-foreground">
										<span>Total</span>
										<span class="text-primary">Rs. {cart.totalWithVat}</span>
									</div>
								</div>
							</div>

							<button
								onclick={placeOrder}
								disabled={isPlacing || cart.items.length === 0}
								class="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none"
							>
								{#if isPlacing}
									<span class="inline-flex items-center gap-2">
										<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
										Placing Order...
									</span>
								{:else}
									Place Order — Rs. {cart.totalWithVat}
								{/if}
							</button>

							<p class="mt-4 text-center text-xs text-muted-foreground">
								Payment will be collected at the restaurant
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>
