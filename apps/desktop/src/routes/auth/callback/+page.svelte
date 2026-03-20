<script lang="ts">
	import { getAuth } from '$lib/stores/auth.svelte';
	import { useConvexClient, api } from '$lib/convex';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle, CheckCircle } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	const auth = getAuth();
	const client = useConvexClient();

	const WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID ?? '';

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let error = $state('');
	let statusMessage = $state('Exchanging authorization code...');

	onMount(async () => {
		const code = $page.url.searchParams.get('code');
		if (!code) {
			status = 'error';
			error = 'No authorization code received from WorkOS.';
			return;
		}

		const codeVerifier = auth.getStoredCodeVerifier();
		if (!codeVerifier) {
			status = 'error';
			error = 'PKCE code verifier not found. Please try logging in again.';
			return;
		}

		try {
			// Step 1: Exchange code for WorkOS user profile (PKCE — no secret needed)
			statusMessage = 'Authenticating with WorkOS...';
			const workosUser = await auth.exchangeCodeForUser(code, WORKOS_CLIENT_ID, codeVerifier);
			auth.clearCodeVerifier();

			if (!workosUser) {
				throw new Error('Failed to get user profile from WorkOS');
			}

			// Step 2: Create or find user in Convex
			statusMessage = 'Setting up your account...';
			await client.mutation(api.auth.loginOrSignup, {
				workosUserId: workosUser.workosUserId,
				email: workosUser.email,
				name: workosUser.name
			} as any);

			// Step 3: Query full user data with restaurants and roles
			statusMessage = 'Loading your restaurants...';
			const userData = await client.query(api.auth.currentUser, {
				workosUserId: workosUser.workosUserId
			} as any) as any;

			if (!userData) {
				throw new Error('User not found after signup');
			}

			// Step 4: Store auth state
			auth.loginWithConvexData({
				user: {
					_id: userData.user._id,
					workosUserId: userData.user.workosUserId,
					email: userData.user.email,
					name: userData.user.name,
					phone: userData.user.phone,
					avatarUrl: userData.user.avatarUrl
				},
				ownedRestaurants: (userData.ownedRestaurants ?? []).map((r: any) => ({
					_id: r._id,
					name: r.name,
					nameNe: r.nameNe,
					slug: r.slug,
					onboardingStatus: r.onboardingStatus,
					subscriptionTier: r.subscriptionTier,
					isActive: r.isActive
				})),
				roles: (userData.roles ?? []).map((r: any) => ({
					restaurantId: r.restaurantId,
					role: r.role,
					restaurant: r.restaurant ? {
						_id: r.restaurant._id,
						name: r.restaurant.name,
						nameNe: r.restaurant.nameNe,
						slug: r.restaurant.slug,
						onboardingStatus: r.restaurant.onboardingStatus,
						subscriptionTier: r.restaurant.subscriptionTier,
						isActive: r.restaurant.isActive
					} : undefined
				}))
			});

			status = 'success';
			statusMessage = 'Sign in complete!';

			// Redirect to restaurant selector
			setTimeout(() => goto('/select'), 500);
		} catch (e) {
			status = 'error';
			error = e instanceof Error ? e.message : 'Authentication failed. Please try again.';
			auth.clearCodeVerifier();
		}
	});
</script>

<div class="flex h-screen items-center justify-center bg-background">
	<div class="text-center space-y-4 max-w-sm">
		{#if status === 'loading'}
			<Loader2 size={40} class="animate-spin mx-auto text-primary" />
			<p class="text-sm text-muted-foreground">{statusMessage}</p>
		{:else if status === 'success'}
			<CheckCircle size={40} class="mx-auto text-success" />
			<p class="text-sm font-medium text-success">{statusMessage}</p>
		{:else}
			<AlertCircle size={40} class="mx-auto text-destructive" />
			<p class="text-sm font-medium text-destructive">Sign In Failed</p>
			<p class="text-xs text-muted-foreground">{error}</p>
			<Button variant="outline" onclick={() => goto('/auth')}>
				Try Again
			</Button>
		{/if}
	</div>
</div>
