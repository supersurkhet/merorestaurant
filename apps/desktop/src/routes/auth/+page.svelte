<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { goto } from '$app/navigation';
	import { LogIn, Crown, Shield, ChefHat, Coffee, Wallet } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const auth = getAuth();
	const i18n = getI18n();
	const theme = getTheme();

	let devRole = $state('owner');

	const roleDescriptions: Record<string, string> = {
		owner: 'Full access — register & manage restaurants',
		manager: 'Manage staff, menu, tables, analytics',
		chef: 'Kitchen display and dashboard',
		waiter: 'Tables, kitchen view, dashboard',
		cashier: 'Fonepay payments and dashboard'
	};

	onMount(() => {
		theme.init();
		if (auth.isAuthenticated) {
			goto('/select');
		}
	});

	function loginWithWorkOS() {
		// In production: redirect to WorkOS AuthKit
		// For now: dev login
		devLogin();
	}

	function devLogin() {
		auth.devLogin(devRole as any);
		goto('/select');
	}
</script>

<div class="flex h-screen items-center justify-center bg-background p-8">
	<Card class="w-full max-w-md p-8 space-y-6">
		<div class="text-center space-y-3">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl mx-auto">
				म
			</div>
			<h1 class="text-2xl font-bold tracking-tight">{i18n.t('auth.signIn')}</h1>
			<p class="text-sm text-muted-foreground">Multi-tenant restaurant management platform</p>
		</div>

		<Button class="w-full h-12 text-base" onclick={loginWithWorkOS}>
			<LogIn size={20} />
			{i18n.t('auth.signInWorkOS')}
		</Button>

		<div class="relative">
			<div class="absolute inset-0 flex items-center"><div class="w-full border-t"></div></div>
			<div class="relative flex justify-center text-xs">
				<span class="bg-card px-2 text-muted-foreground">{i18n.t('auth.devMode')}</span>
			</div>
		</div>

		<div class="space-y-3">
			<label class="text-sm font-medium block" for="devRole">{i18n.t('auth.selectRole')}</label>
			<Select id="devRole" bind:value={devRole}>
				{#each Object.entries(roleDescriptions) as [role, desc]}
					<option value={role}>{role.charAt(0).toUpperCase() + role.slice(1)} — {desc}</option>
				{/each}
			</Select>
			<Button variant="outline" class="w-full" onclick={devLogin}>
				{i18n.t('auth.devSignIn')}
			</Button>
		</div>

		<p class="text-[10px] text-center text-muted-foreground">
			Mero Restaurant Platform — Surkhet, Nepal
		</p>
	</Card>
</div>
