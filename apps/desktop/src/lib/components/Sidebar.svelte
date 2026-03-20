<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
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
		LogOut
	} from 'lucide-svelte';

	const i18n = getI18n();
	const theme = getTheme();

	const navItems = [
		{ href: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
		{ href: '/kitchen', icon: ChefHat, label: 'nav.kitchen' },
		{ href: '/tables', icon: Table2, label: 'nav.tables' },
		{ href: '/menu', icon: UtensilsCrossed, label: 'nav.menu' },
		{ href: '/staff', icon: Users, label: 'nav.staff' },
		{ href: '/wifi', icon: Wifi, label: 'nav.wifi' },
		{ href: '/fonepay', icon: QrCode, label: 'nav.fonepay' },
		{ href: '/analytics', icon: BarChart3, label: 'nav.analytics' }
	];

	let currentPath = $derived($page.url.pathname);
</script>

<aside class="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
	<!-- Brand -->
	<div class="flex h-16 items-center gap-3 border-b px-5">
		<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
			म
		</div>
		<div class="flex flex-col">
			<span class="text-sm font-bold tracking-tight">{i18n.t('app.name')}</span>
			<span class="text-[10px] text-muted-foreground uppercase tracking-widest">Admin</span>
		</div>
	</div>

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
				{#if item.href === '/kitchen'}
					<span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
						4
					</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom controls -->
	<div class="border-t p-3 space-y-2">
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
				<span>Light Mode</span>
			{:else}
				<Moon size={18} />
				<span>Dark Mode</span>
			{/if}
		</button>

		<!-- Logout -->
		<button
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
		>
			<LogOut size={18} />
			<span>Logout</span>
		</button>
	</div>
</aside>
