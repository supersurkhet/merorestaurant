<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...rest}>
	{@render children()}
</div>
