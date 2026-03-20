<script lang="ts">
	import { t } from '$i18n';
</script>

<svelte:head>
	<title>{$t('privacy.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6">
		<h1 class="font-[var(--font-display)] text-4xl font-bold text-white">
			{$t('privacy.title')}
		</h1>
	</div>
</section>

<section class="bg-background py-16">
	<div class="prose prose-gray dark:prose-invert mx-auto max-w-3xl px-4 sm:px-6">
		<p class="text-muted-foreground"><em>{$t('privacy.updated')}</em></p>

		<h2>{$t('privacy.collect.title')}</h2>
		<p>{$t('privacy.collect.desc')}</p>

		<h2>{$t('privacy.use.title')}</h2>
		<ul>
			<li>{$t('privacy.use.1')}</li>
			<li>{$t('privacy.use.2')}</li>
			<li>{$t('privacy.use.3')}</li>
			<li>{$t('privacy.use.4')}</li>
		</ul>

		<h2>{$t('privacy.storage.title')}</h2>
		<p>{$t('privacy.storage.desc')}</p>

		<h2>{$t('privacy.wifi.title')}</h2>
		<p>{$t('privacy.wifi.desc')}</p>

		<h2>{$t('privacy.contact.title')}</h2>
		<p>
			{$t('privacy.contact.desc')}
			<a href="mailto:hello@merorestaurant.com" class="text-primary">hello@merorestaurant.com</a>
			{$t('privacy.contact.suffix')}
		</p>
	</div>
</section>
