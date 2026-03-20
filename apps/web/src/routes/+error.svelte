<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$i18n';
	import { AlertTriangle, Home, ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Error {page.status} — {$t('site.name')}</title>
</svelte:head>

<section class="flex min-h-[80vh] items-center bg-background">
	<div class="mx-auto w-full max-w-lg px-4 py-32 text-center">
		<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
			<AlertTriangle class="h-10 w-10 text-red-500" />
		</div>

		<h1 class="font-[var(--font-display)] text-6xl font-bold text-foreground">
			{page.status}
		</h1>

		<p class="mt-4 text-lg text-muted-foreground">
			{#if page.status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else if page.status === 500}
				Something went wrong on our end. Please try again later.
			{:else}
				{page.error?.message || 'An unexpected error occurred.'}
			{/if}
		</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<a
				href="/"
				class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
			>
				<Home class="h-4 w-4" />
				{$t('order.backToHome')}
			</a>
			<button
				onclick={() => history.back()}
				class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
			>
				<ArrowLeft class="h-4 w-4" />
				Go Back
			</button>
		</div>

		<div class="mt-12 border-t border-border pt-6">
			<span class="text-3xl">🍛</span>
			<p class="mt-2 text-sm font-medium text-foreground">{$t('site.name')}</p>
		</div>
	</div>
</section>
