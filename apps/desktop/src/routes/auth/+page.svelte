<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { getTheme } from '$lib/stores/theme.svelte';
	import { goto } from '$app/navigation';
	import { LogIn, Loader2, AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const auth = getAuth();
	const i18n = getI18n();
	const theme = getTheme();

	let isRedirecting = $state(false);
	let error = $state('');

	const WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID ?? '';
	const WORKOS_REDIRECT_URI = import.meta.env.VITE_WORKOS_REDIRECT_URI ?? 'http://localhost:5173/auth/callback';

	onMount(() => {
		theme.init();
		if (auth.isAuthenticated) {
			goto('/select');
		}
	});

	async function loginWithWorkOS() {
		if (!WORKOS_CLIENT_ID) {
			error = 'WorkOS client ID not configured. Set VITE_WORKOS_CLIENT_ID in .env';
			return;
		}

		isRedirecting = true;
		error = '';

		try {
			const authUrl = await auth.startOAuthFlow(WORKOS_CLIENT_ID, WORKOS_REDIRECT_URI);

			// In Tauri: open system browser for OAuth
			if (typeof window !== 'undefined' && (window as any).__TAURI__) {
				await (window as any).__TAURI__.shell.open(authUrl);
			} else {
				// In browser: redirect directly
				window.location.href = authUrl;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to start login';
			isRedirecting = false;
		}
	}
</script>

<div class="flex h-screen items-center justify-center bg-background p-8">
	<Card class="w-full max-w-md p-8 space-y-6">
		<div class="text-center space-y-3">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl mx-auto">
				म
			</div>
			<h1 class="text-2xl font-bold tracking-tight">{i18n.t('auth.signIn')}</h1>
			<p class="text-sm text-muted-foreground">{i18n.t('auth.signInDesc')}</p>
		</div>

		{#if error}
			<div class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
				<AlertCircle size={16} class="shrink-0" />
				{error}
			</div>
		{/if}

		<Button
			class="w-full h-12 text-base"
			onclick={loginWithWorkOS}
			disabled={isRedirecting}
		>
			{#if isRedirecting}
				<Loader2 size={20} class="animate-spin" />
				Redirecting to WorkOS...
			{:else}
				<LogIn size={20} />
				{i18n.t('auth.signInWorkOS')}
			{/if}
		</Button>

		{#if isRedirecting}
			<p class="text-xs text-center text-muted-foreground">
				Complete sign-in in your browser. This page will update automatically.
			</p>
		{/if}

		<p class="text-[10px] text-center text-muted-foreground">
			Mero Restaurant Platform — Surkhet, Nepal
		</p>
	</Card>
</div>
