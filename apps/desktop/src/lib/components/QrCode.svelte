<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	interface Props {
		data: string;
		size?: number;
		darkColor?: string;
		lightColor?: string;
		class?: string;
	}

	let {
		data,
		size = 256,
		darkColor = '#000000',
		lightColor = '#ffffff',
		class: className = ''
	}: Props = $props();

	let svgString = $state('');

	async function generate() {
		if (!data) {
			svgString = '';
			return;
		}
		try {
			svgString = await QRCode.toString(data, {
				type: 'svg',
				width: size,
				margin: 2,
				color: {
					dark: darkColor,
					light: lightColor
				}
			});
		} catch {
			svgString = '';
		}
	}

	onMount(() => generate());

	$effect(() => {
		// Re-generate when data changes
		void data;
		generate();
	});
</script>

{#if svgString}
	<div class={className} style="width: {size}px; height: {size}px;">
		{@html svgString}
	</div>
{:else}
	<div
		class="flex items-center justify-center border-2 border-dashed border-muted rounded-xl {className}"
		style="width: {size}px; height: {size}px;"
	>
		<span class="text-xs text-muted-foreground">No QR data</span>
	</div>
{/if}
