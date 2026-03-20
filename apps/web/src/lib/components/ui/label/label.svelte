<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	let {
		class: className = '',
		children,
		...restProps
	}: { class?: string; children: Snippet } & HTMLLabelAttributes = $props();
</script>

<label
	class="mb-1.5 block text-[13px] font-medium text-foreground {className}"
	{...restProps}
>{@render children()}</label>
