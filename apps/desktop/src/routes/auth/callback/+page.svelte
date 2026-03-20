<script lang="ts">
	import { getAuth } from '$lib/stores/auth.svelte';
	import { useConvexClient, api } from '$lib/convex';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Loader2 } from 'lucide-svelte';

	const auth = getAuth();
	const client = useConvexClient();

	let error = $state('');

	onMount(async () => {
		const code = $page.url.searchParams.get('code');
		if (!code) {
			error = 'No authorization code received';
			return;
		}

		try {
			// In a real implementation, exchange the code for a token server-side
			// For now, we'll use the code to look up the user via Convex
			// The WorkOS SDK would normally handle this exchange

			// Stub: In production, call your backend to exchange code → user profile
			// Then call api.auth.loginOrSignup with the WorkOS user data
			// For demo: redirect to select page
			error = 'OAuth callback received. Configure server-side token exchange for production.';
			setTimeout(() => goto('/select'), 2000);
		} catch (e) {
			error = `Authentication failed: ${e instanceof Error ? e.message : String(e)}`;
		}
	});
</script>

<div class="flex h-screen items-center justify-center bg-background">
	<div class="text-center space-y-4">
		{#if error}
			<p class="text-sm text-muted-foreground">{error}</p>
		{:else}
			<Loader2 size={32} class="animate-spin mx-auto text-primary" />
			<p class="text-sm text-muted-foreground">Completing sign in...</p>
		{/if}
	</div>
</div>
