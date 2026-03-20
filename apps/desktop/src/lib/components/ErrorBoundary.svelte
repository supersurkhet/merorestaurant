<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { AlertTriangle, RefreshCw } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	const i18n = getI18n();

	let hasError = $state(false);
	let errorMessage = $state('');

	function handleError(error: unknown, reset: () => void) {
		hasError = true;
		errorMessage = error instanceof Error ? error.message : String(error);
	}

	function retry() {
		hasError = false;
		errorMessage = '';
	}
</script>

<svelte:boundary onerror={handleError}>
	{#if hasError}
		<div class="flex h-full min-h-[300px] items-center justify-center p-8">
			<div class="text-center space-y-4 max-w-sm">
				<div class="flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle size={32} class="text-destructive" />
					</div>
				</div>
				<h2 class="text-xl font-bold">{i18n.t('error.title')}</h2>
				<p class="text-sm text-muted-foreground">{i18n.t('error.description')}</p>
				{#if errorMessage}
					<code class="block text-xs text-muted-foreground bg-muted rounded-md p-2 break-all">
						{errorMessage}
					</code>
				{/if}
				<Button onclick={retry}>
					<RefreshCw size={14} /> {i18n.t('error.retry')}
				</Button>
			</div>
		</div>
	{:else}
		{@render children()}
	{/if}
</svelte:boundary>
