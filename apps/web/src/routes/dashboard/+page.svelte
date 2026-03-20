<script lang="ts">
	import { t } from '$i18n';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex-api';
	import {
		ClipboardList, DollarSign, LayoutGrid, Download, ArrowRight,
		UtensilsCrossed, Users, Check, Circle, Loader2, Shield
	} from 'lucide-svelte';

	// In production, workosUserId comes from auth session
	// For now, this page shows a placeholder
	const isAuthenticated = false; // TODO: wire to WorkOS AuthKit session

	const onboardingSteps = [
		{ id: 'registered', label: 'Account Created', done: true },
		{ id: 'profile_complete', label: 'Restaurant Profile', done: false },
		{ id: 'menu_added', label: 'Menu Added', done: false },
		{ id: 'tables_configured', label: 'Tables Configured', done: false },
		{ id: 'operational', label: 'Go Live', done: false }
	];
</script>

<svelte:head>
	<title>{$t('dashboard.title')} — {$t('site.name')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-5xl px-5">
		{#if !isAuthenticated}
			<!-- Not logged in — prompt to register/login -->
			<div class="mx-auto max-w-md text-center">
				<div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
					<Shield class="h-7 w-7 text-primary" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">{$t('dashboard.title')}</h1>
				<p class="mt-2 text-muted-foreground">Sign in to access your restaurant dashboard.</p>
				<div class="mt-8 flex flex-col gap-3">
					<a href="/register" class="rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">{$t('nav.getStarted')}</a>
					<a href="/register" class="rounded-xl border border-border py-3 text-center text-sm font-medium text-foreground hover:bg-secondary">{$t('nav.login')}</a>
				</div>
			</div>
		{:else}
			<!-- Dashboard -->
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-foreground">{$t('dashboard.welcome')}</h1>
			</div>

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
					{#each onboardingSteps as step, i}
						<div class="flex items-center gap-2">
							{#if step.done}
								<div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
									<Check class="h-3.5 w-3.5 text-primary-foreground" />
								</div>
							{:else}
								<div class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border">
									<Circle class="h-2.5 w-2.5 text-muted-foreground/40" />
								</div>
							{/if}
							<span class="hidden text-[12px] sm:inline {step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}">{step.label}</span>
						</div>
						{#if i < onboardingSteps.length - 1}
							<div class="h-px flex-1 {step.done ? 'bg-primary' : 'bg-border'}"></div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<a href="/download" class="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20">
					<Download class="mb-3 h-5 w-5 text-primary" />
					<h3 class="text-[14px] font-semibold text-foreground">{$t('dashboard.downloadApp')}</h3>
					<p class="mt-1 text-[12px] text-muted-foreground">{$t('dashboard.downloadAppDesc')}</p>
				</a>
				{#each [
					{ icon: UtensilsCrossed, key: 'dashboard.manageMenu' },
					{ icon: Users, key: 'dashboard.manageStaff' }
				] as action}
					<div class="group rounded-xl border border-border bg-card p-5 opacity-60">
						<action.icon class="mb-3 h-5 w-5 text-muted-foreground" />
						<h3 class="text-[14px] font-semibold text-foreground">{$t(action.key)}</h3>
						<p class="mt-1 text-[12px] text-muted-foreground">Available in desktop app</p>
					</div>
				{/each}
			</div>

			<!-- Subscription -->
			<div class="mt-8 flex items-center justify-between rounded-xl border border-border bg-card p-5">
				<div>
					<p class="text-[12px] text-muted-foreground">{$t('dashboard.subscription')}</p>
					<p class="text-[15px] font-semibold text-foreground">Free</p>
				</div>
				<a href="/pricing" class="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-[13px] font-medium text-primary hover:bg-primary/20">
					{$t('dashboard.upgrade')}
					<ArrowRight class="h-3.5 w-3.5" />
				</a>
			</div>
		{/if}
	</div>
</section>
