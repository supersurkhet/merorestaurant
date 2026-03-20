<script lang="ts">
	import { t } from '$i18n';
</script>

<svelte:head>
	<title>{$t('terms.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6">
		<h1 class="font-[var(--font-display)] text-4xl font-bold text-white">
			{$t('terms.title')}
		</h1>
	</div>
</section>

<section class="bg-background py-16">
	<div class="prose prose-gray dark:prose-invert mx-auto max-w-3xl px-4 sm:px-6">
		<p class="text-muted-foreground"><em>{$t('terms.updated')}</em></p>

		<h2>{$t('terms.acceptance.title')}</h2>
		<p>{$t('terms.acceptance.desc')}</p>

		<h2>{$t('terms.orders.title')}</h2>
		<ul>
			<li>{$t('terms.orders.1')}</li>
			<li>{$t('terms.orders.2')}</li>
			<li>{$t('terms.orders.3')}</li>
			<li>{$t('terms.orders.4')}</li>
		</ul>

		<h2>{$t('terms.delivery.title')}</h2>
		<p>{$t('terms.delivery.desc')}</p>

		<h2>{$t('terms.cancellation.title')}</h2>
		<p>{$t('terms.cancellation.desc')}</p>

		<h2>{$t('terms.wifi.title')}</h2>
		<p>{$t('terms.wifi.desc')}</p>

		<h2>{$t('terms.contact.title')}</h2>
		<p>
			{$t('terms.contact.desc')}
			<a href="mailto:hello@merorestaurant.com" class="text-primary">hello@merorestaurant.com</a>.
		</p>
	</div>
</section>
