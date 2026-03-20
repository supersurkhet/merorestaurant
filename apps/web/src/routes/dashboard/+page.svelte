<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/state';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import {
		ClipboardList, DollarSign, LayoutGrid, Download, ArrowRight,
		UtensilsCrossed, Users, Check, Circle, Loader2, Shield, LogOut
	} from 'lucide-svelte';

	const user = $derived(page.data?.user as { id: string; email: string; firstName?: string; lastName?: string } | null);

	// Convex: find this user's record to get their restaurants
	let convexClient: ReturnType<typeof useConvexClient> | null = null;
	try { convexClient = useConvexClient(); } catch {}

	const convexUser = useQuery(
		api.auth.currentUser,
		() => (user?.id ? { workosUserId: user.id } : 'skip')
	);

	const restaurants = $derived(convexUser.data?.ownedRestaurants ?? []);
	const primaryRestaurant = $derived(restaurants[0]);

	const onboardingSteps = $derived([
		{ label: 'Account Created', done: true },
		{ label: 'Restaurant Profile', done: !!primaryRestaurant },
		{ label: 'Menu Added', done: primaryRestaurant?.onboardingStatus === 'menu_added' || primaryRestaurant?.onboardingStatus === 'tables_configured' || primaryRestaurant?.onboardingStatus === 'operational' },
		{ label: 'Tables Configured', done: primaryRestaurant?.onboardingStatus === 'tables_configured' || primaryRestaurant?.onboardingStatus === 'operational' },
		{ label: 'Go Live', done: primaryRestaurant?.onboardingStatus === 'operational' }
	]);
</script>

<svelte:head>
	<title>{$t('dashboard.title')} — {$t('site.name')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-5xl px-5">
		{#if !user}
			<div class="mx-auto max-w-md text-center">
				<div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
					<Shield class="h-7 w-7 text-primary" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">{$t('dashboard.title')}</h1>
				<p class="mt-2 text-muted-foreground">Sign in to access your restaurant dashboard.</p>
				<a href="/api/auth/login?returnTo=/dashboard" class="mt-8 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{$t('nav.login')}</a>
			</div>
		{:else}
			<div class="mb-8 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-foreground">{$t('dashboard.welcome')}, {user.firstName || user.email}</h1>
					{#if primaryRestaurant}
						<p class="mt-1 text-[13px] text-muted-foreground">{primaryRestaurant.name} · {primaryRestaurant.city}</p>
					{/if}
				</div>
				<a href="/api/auth/logout" class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground">
					<LogOut class="h-3.5 w-3.5" />
					Log out
				</a>
			</div>

			{#if !primaryRestaurant}
				<!-- No restaurant yet — prompt to create -->
				<div class="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
					<h2 class="text-lg font-bold text-foreground">Create Your Restaurant</h2>
					<p class="mt-2 text-sm text-muted-foreground">You haven't set up a restaurant yet. Let's get started.</p>
					<a href="/register" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
						{$t('register.submit')}
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			{:else}
				<!-- Stats -->
				<div class="grid gap-4 sm:grid-cols-3">
					{#each [
						{ icon: ClipboardList, label: $t('dashboard.ordersToday'), value: '—', color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400' },
						{ icon: DollarSign, label: $t('dashboard.revenueToday'), value: '—', color: 'text-green-600 bg-green-100 dark:bg-green-950/30 dark:text-green-400' },
						{ icon: LayoutGrid, label: $t('dashboard.activeTables'), value: '—', color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400' }
					] as stat}
						<div class="rounded-xl border border-border bg-card p-5">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-lg {stat.color}">
									<stat.icon class="h-5 w-5" />
								</div>
								<div>
									<p class="text-[12px] text-muted-foreground">{stat.label}</p>
									<p class="text-xl font-bold text-foreground">{stat.value}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Onboarding Progress -->
				<div class="mt-8 rounded-xl border border-border bg-card p-6">
					<h2 class="mb-4 text-[15px] font-semibold text-foreground">{$t('dashboard.onboarding')}</h2>
					<div class="flex items-center gap-2">
						{#each onboardingSteps as s, i}
							<div class="flex items-center gap-2">
								{#if s.done}
									<div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary"><Check class="h-3.5 w-3.5 text-primary-foreground" /></div>
								{:else}
									<div class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border"><Circle class="h-2.5 w-2.5 text-muted-foreground/40" /></div>
								{/if}
								<span class="hidden text-[12px] sm:inline {s.done ? 'text-foreground font-medium' : 'text-muted-foreground'}">{s.label}</span>
							</div>
							{#if i < onboardingSteps.length - 1}
								<div class="h-px flex-1 {s.done ? 'bg-primary' : 'bg-border'}"></div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="mt-8 grid gap-4 sm:grid-cols-3">
					<a href="/download" class="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20">
						<Download class="mb-3 h-5 w-5 text-primary" />
						<h3 class="text-[14px] font-semibold text-foreground">{$t('dashboard.downloadApp')}</h3>
						<p class="mt-1 text-[12px] text-muted-foreground">{$t('dashboard.downloadAppDesc')}</p>
					</a>
					<div class="rounded-xl border border-border bg-card p-5 opacity-60">
						<UtensilsCrossed class="mb-3 h-5 w-5 text-muted-foreground" />
						<h3 class="text-[14px] font-semibold text-foreground">{$t('dashboard.manageMenu')}</h3>
						<p class="mt-1 text-[12px] text-muted-foreground">Available in desktop app</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-5 opacity-60">
						<Users class="mb-3 h-5 w-5 text-muted-foreground" />
						<h3 class="text-[14px] font-semibold text-foreground">{$t('dashboard.manageStaff')}</h3>
						<p class="mt-1 text-[12px] text-muted-foreground">Available in desktop app</p>
					</div>
				</div>

				<!-- Subscription -->
				<div class="mt-8 flex items-center justify-between rounded-xl border border-border bg-card p-5">
					<div>
						<p class="text-[12px] text-muted-foreground">{$t('dashboard.subscription')}</p>
						<p class="text-[15px] font-semibold capitalize text-foreground">{primaryRestaurant.subscriptionTier || 'Free'}</p>
					</div>
					<a href="/pricing" class="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-[13px] font-medium text-primary hover:bg-primary/20">
						{$t('dashboard.upgrade')}
						<ArrowRight class="h-3.5 w-3.5" />
					</a>
				</div>
			{/if}
		{/if}
	</div>
</section>
