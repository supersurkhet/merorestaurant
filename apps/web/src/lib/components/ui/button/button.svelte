<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
	type Size = 'default' | 'sm' | 'lg' | 'icon';

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		href = undefined as string | undefined,
		disabled = false,
		onclick = undefined as ((e: Event) => void) | undefined,
		children,
		...restProps
	}: {
		variant?: Variant;
		size?: Size;
		class?: string;
		href?: string;
		disabled?: boolean;
		onclick?: (e: Event) => void;
		children: Snippet;
		[key: string]: any;
	} = $props();

	const base = 'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

	const variants: Record<Variant, string> = {
		default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
		outline: 'border border-border bg-background hover:bg-secondary hover:text-foreground',
		ghost: 'hover:bg-secondary hover:text-foreground',
		destructive: 'bg-destructive text-white hover:bg-destructive/90',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	const sizes: Record<Size, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-8 px-3 text-[13px]',
		lg: 'h-12 px-6 text-[15px]',
		icon: 'h-9 w-9'
	};

	const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
</script>

{#if href}
	<a {href} class={classes}>{@render children()}</a>
{:else}
	<button class={classes} {disabled} {onclick} aria-label={restProps['aria-label']}>{@render children()}</button>
{/if}
