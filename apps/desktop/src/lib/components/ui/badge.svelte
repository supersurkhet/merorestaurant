<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', class: className, children }: Props = $props();

	const variants = {
		default: 'bg-primary text-primary-foreground',
		secondary: 'bg-secondary text-secondary-foreground',
		outline: 'border border-border text-foreground',
		destructive: 'bg-destructive text-destructive-foreground',
		success: 'bg-success text-success-foreground',
		warning: 'bg-warning text-warning-foreground'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
		variants[variant],
		className
	)}
>
	{@render children()}
</span>
