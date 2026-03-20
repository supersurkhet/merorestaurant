<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		class?: string;
		children: Snippet;
	}

	let { open = $bindable(false), onclose, class: className, children }: Props = $props();

	function handleBackdrop() {
		open = false;
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleBackdrop();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-black/50 backdrop-blur-sm"
			onclick={handleBackdrop}
			onkeydown={handleKeydown}
		></div>
		<div
			class={cn(
				'relative z-50 w-full max-w-lg rounded-xl border bg-background p-6 shadow-2xl',
				className
			)}
		>
			{@render children()}
		</div>
	</div>
{/if}
