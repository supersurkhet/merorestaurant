<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import {
		LayoutDashboard,
		ChefHat,
		Table2,
		UtensilsCrossed,
		Users,
		Wifi,
		QrCode,
		BarChart3,
		Sun,
		Moon,
		Languages,
		LogOut,
		Crown,
		Shield,
		Coffee
	} from 'lucide-svelte';

	const i18n = getI18n();
	const theme = getTheme();
	const auth = getAuth();
	const data = getData();

	// All nav items with role requirements
	const allNavItems = [
		{ href: '/', icon: LayoutDashboard, label: 'nav.dashboard', roles: null },
		{ href: '/kitchen', icon: ChefHat, label: 'nav.kitchen', roles: ['owner', 'manager', 'kitchen', 'waiter'] },
		{ href: '/tables', icon: Table2, label: 'nav.tables', roles: ['owner', 'manager', 'waiter'] },
		{ href: '/menu', icon: UtensilsCrossed, label: 'nav.menu', roles: ['owner', 'manager'] },
		{ href: '/staff', icon: Users, label: 'nav.staff', roles: ['owner', 'manager'] },
		{ href: '/wifi', icon: Wifi, label: 'nav.wifi', roles: ['owner', 'manager'] },
		{ href: '/fonepay', icon: QrCode, label: 'nav.fonepay', roles: ['owner', 'manager', 'cashier'] },
		{ href: '/analytics', icon: BarChart3, label: 'nav.analytics', roles: ['owner', 'manager'] }
	];

	// Filter by user role
	const navItems = $derived(
		allNavItems.filter((item) => {
			if (!item.roles) return true;
			const role = auth.role;
			return role ? item.roles.includes(role) : true;
		})
	);

	const activeOrderCount = $derived(data.activeOrders.length);

	let currentPath = $derived($page.url.pathname);

	const roleIcons: Record<string, typeof Crown> = {
		owner: Crown,
		manager: Shield,
		kitchen: ChefHat,
		waiter: Coffee,
		cashier: QrCode
	};

	function handleLogout() {
		auth.logout();
		goto('/auth');
	}
</script>

<aside class="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
	<!-- Brand -->
	<div class="flex h-16 items-center gap-3 border-b px-5" data-tauri-drag-region>
		<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
			म
		</div>
		<div class="flex flex-col">
			<span class="text-sm font-bold tracking-tight">{i18n.t('app.name')}</span>
			<span class="text-[10px] text-muted-foreground uppercase tracking-widest">Admin</span>
		</div>
	</div>

	<!-- User Info -->
	{#if auth.isAuthenticated && auth.user}
		{@const RoleIcon = roleIcons[auth.role ?? ''] ?? Crown}
		<div class="px-3 py-3 border-b">
			<div class="flex items-center gap-3 rounded-lg px-3 py-2 bg-accent/50">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
					{auth.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-xs font-medium truncate">{auth.user.name}</p>
					<div class="flex items-center gap-1 text-[10px] text-muted-foreground">
						<RoleIcon size={9} />
						{i18n.t(`role.${auth.role}`)}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Navigation -->
	<nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
		{#each navItems as item}
			{@const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
					isActive
						? 'bg-primary/10 text-primary'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
		<!-- Language toggle -->
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onclick={() => i18n.toggleLocale()}
		>
			<Languages size={18} />
			<span>{i18n.locale === 'en' ? 'नेपाली' : 'English'}</span>
		</button>

		<!-- Theme toggle -->
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onclick={() => theme.toggle()}
		>
			{#if theme.isDark}
				<Sun size={18} />
				<span>{i18n.t('theme.light')}</span>
			{:else}
				<Moon size={18} />
				<span>{i18n.t('theme.dark')}</span>
			{/if}
		</button>

		<!-- Logout -->
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
			onclick={handleLogout}
		>
			<LogOut size={18} />
			<span>{i18n.t('auth.signOut')}</span>
		</button>
	</div>
</aside>
