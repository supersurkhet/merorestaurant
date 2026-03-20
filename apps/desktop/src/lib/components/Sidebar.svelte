<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getRestaurant } from '$lib/stores/restaurant.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import {
		LayoutDashboard, ChefHat, Table2, UtensilsCrossed, Users, Wifi,
		QrCode, BarChart3, Sun, Moon, Languages, LogOut, Building2,
		ChevronsUpDown, Crown, Shield, Coffee
	} from 'lucide-svelte';

	const i18n = getI18n();
	const theme = getTheme();
	const auth = getAuth();
	const restaurant = getRestaurant();
	const data = getData();

	let showSwitcher = $state(false);

	const allNavItems = [
		{ href: '/', icon: LayoutDashboard, label: 'nav.dashboard', page: 'dashboard' },
		{ href: '/kitchen', icon: ChefHat, label: 'nav.kitchen', page: 'kitchen' },
		{ href: '/tables', icon: Table2, label: 'nav.tables', page: 'tables' },
		{ href: '/menu', icon: UtensilsCrossed, label: 'nav.menu', page: 'menu' },
		{ href: '/staff', icon: Users, label: 'nav.staff', page: 'staff' },
		{ href: '/wifi', icon: Wifi, label: 'nav.wifi', page: 'wifi' },
		{ href: '/fonepay', icon: QrCode, label: 'nav.fonepay', page: 'fonepay' },
		{ href: '/analytics', icon: BarChart3, label: 'nav.analytics', page: 'analytics' }
	];

	const navItems = $derived(
		allNavItems.filter((item) => {
			if (!restaurant.id) return item.page === 'dashboard';
			return auth.canView(restaurant.id, item.page);
		})
	);

	const activeOrderCount = $derived(data.activeOrders.length);
	let currentPath = $derived($page.url.pathname);

	function handleLogout() {
		auth.logout();
		restaurant.clear();
		goto('/auth');
	}

	function switchRestaurant(r: any) {
		restaurant.set({
			id: r._id,
			name: r.name,
			nameNe: r.nameNe,
			slug: r.slug,
			onboardingStatus: r.onboardingStatus,
			subscriptionTier: r.subscriptionTier
		});
		showSwitcher = false;
		if (r.onboardingStatus !== 'operational') {
			goto('/onboard');
		} else {
			goto('/');
		}
	}
</script>

<aside class="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
	<!-- Restaurant header with switcher -->
	<div class="border-b">
		<button
			class="flex w-full items-center gap-3 px-5 py-4 hover:bg-accent/50 transition-colors"
			onclick={() => (showSwitcher = !showSwitcher)}
			data-tauri-drag-region
		>
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
				{restaurant.name ? restaurant.name.charAt(0) : 'म'}
			</div>
			<div class="flex-1 min-w-0 text-left">
				<p class="text-sm font-bold tracking-tight truncate">{restaurant.name || i18n.t('app.name')}</p>
				<p class="text-[10px] text-muted-foreground uppercase tracking-widest">
					{restaurant.subscriptionTier} tier
				</p>
			</div>
			<ChevronsUpDown size={14} class="text-muted-foreground shrink-0" />
		</button>

		<!-- Restaurant switcher dropdown -->
		{#if showSwitcher}
			<div class="border-t bg-card p-2 space-y-1 max-h-48 overflow-y-auto">
				{#each auth.allRestaurants as r}
					<button
						class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors {r._id === restaurant.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}"
						onclick={() => switchRestaurant(r)}
					>
						<Building2 size={14} />
						<span class="truncate">{r.name}</span>
					</button>
				{/each}
				<button
					class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-primary hover:bg-accent transition-colors border-t mt-1 pt-2"
					onclick={() => { showSwitcher = false; goto('/onboard'); }}
				>
					<Building2 size={14} />
					Register New Restaurant
				</button>
			</div>
		{/if}
	</div>

	<!-- User info -->
	{#if auth.isAuthenticated && auth.user}
		<div class="px-3 py-2 border-b">
			<div class="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-accent/30">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
					{auth.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-xs font-medium truncate">{auth.user.name}</p>
					{#if restaurant.id}
						{@const role = auth.roleFor(restaurant.id)}
						{#if role}
							<p class="text-[10px] text-muted-foreground capitalize">{i18n.t(`role.${role}`)}</p>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Navigation -->
	<nav class="flex-1 space-y-1 overflow-y-auto px-3 py-3">
		{#each navItems as item}
			{@const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
					isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				)}
			>
				<item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
				<span>{i18n.t(item.label)}</span>
				{#if item.href === '/kitchen' && activeOrderCount > 0}
					<span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
						{activeOrderCount}
					</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom controls -->
	<div class="border-t p-3 space-y-1">
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onclick={() => i18n.toggleLocale()}
		>
			<Languages size={18} />
			<span>{i18n.locale === 'en' ? 'नेपाली' : 'English'}</span>
		</button>
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onclick={() => theme.toggle()}
		>
			{#if theme.isDark}
				<Sun size={18} /><span>{i18n.t('theme.light')}</span>
			{:else}
				<Moon size={18} /><span>{i18n.t('theme.dark')}</span>
			{/if}
		</button>
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
			onclick={handleLogout}
		>
			<LogOut size={18} /><span>{i18n.t('auth.signOut')}</span>
		</button>
	</div>
</aside>
