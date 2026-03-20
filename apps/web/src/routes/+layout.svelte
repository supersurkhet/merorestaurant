<script lang="ts">
	import '../app.css';
	import Navbar from '$components/Navbar.svelte';
	import Footer from '$components/Footer.svelte';
	import ConvexProvider from '$components/ConvexProvider.svelte';
	import { initTheme } from '$lib/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:boundary>
	<ConvexProvider>
		<div class="flex min-h-screen flex-col">
			<Navbar />
			<main class="flex-1">
				{@render children()}
			</main>
			<Footer />
		</div>
	</ConvexProvider>

	{#snippet failed(error)}
		<div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
			<span class="text-5xl">🍛</span>
			<h1 class="mt-4 font-[var(--font-display)] text-2xl font-bold text-foreground">
				Something went wrong
			</h1>
			<p class="mt-2 max-w-md text-sm text-muted-foreground">
				We're having trouble loading the page. Please refresh or try again later.
			</p>
			<button
				onclick={() => location.reload()}
				class="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Refresh Page
			</button>
		</div>
	{/snippet}
</svelte:boundary>
