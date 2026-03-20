<script lang="ts">
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { goto } from '$app/navigation';
	import { ShieldAlert } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		allowed?: boolean;
		children: Snippet;
	}

	let { allowed = true, children }: Props = $props();

	const auth = getAuth();
	const i18n = getI18n();

	$effect(() => {
		if (!auth.isLoading && !auth.isAuthenticated) {
			goto('/auth');
		}
	});
</script>

{#if auth.isLoading}
	<div class="flex h-full items-center justify-center">
		<div class="text-center space-y-3">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
			<p class="text-sm text-muted-foreground">{i18n.t('common.loading')}</p>
		</div>
	</div>
{:else if !auth.isAuthenticated}
	<!-- Will redirect via $effect -->
{:else if !allowed}
	<div class="flex h-full items-center justify-center">
		<div class="text-center space-y-4">
			<ShieldAlert size={48} class="mx-auto text-destructive/60" />
			<h2 class="text-xl font-bold">{i18n.t('auth.accessDenied')}</h2>
			<p class="text-sm text-muted-foreground max-w-sm">
				{i18n.t('auth.accessDeniedDesc')}
			</p>
			<Button variant="outline" onclick={() => goto('/')}>
				{i18n.t('nav.dashboard')}
			</Button>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
