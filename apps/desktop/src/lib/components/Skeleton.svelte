<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		variant?: 'text' | 'card' | 'avatar' | 'chart';
		count?: number;
	}

	let { class: className, variant = 'text', count = 1 }: Props = $props();

	const variantClasses = {
		text: 'h-4 rounded-md',
		card: 'h-32 rounded-xl',
		avatar: 'h-12 w-12 rounded-full',
		chart: 'h-48 rounded-xl'
	};
</script>

{#each Array(count) as _, i}
	<div
		class={cn(
			'animate-pulse bg-muted',
			variantClasses[variant],
			variant === 'text' && i === count - 1 ? 'w-3/4' : 'w-full',
			className
		)}
	></div>
{/each}
