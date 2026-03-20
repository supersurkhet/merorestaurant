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
		<p class="text-muted-foreground"><em>Last updated: March 2026</em></p>

		<h2>Information We Collect</h2>
		<p>
			When you use Mero Restaurant's website or mobile application, we may collect information
			you provide directly, such as your name, email, phone number, and delivery address when
			placing orders.
		</p>

		<h2>How We Use Your Information</h2>
		<ul>
			<li>To process and fulfill your food orders</li>
			<li>To send order confirmations and updates</li>
			<li>To improve our services and menu offerings</li>
			<li>To communicate special offers (with your consent)</li>
		</ul>

		<h2>Data Storage</h2>
		<p>
			Your data is stored securely and we do not sell or share your personal information with
			third parties except as necessary to process your orders (e.g., payment processors).
		</p>

		<h2>WiFi Usage</h2>
		<p>
			Our free WiFi service collects basic connection data for network management purposes only.
			We do not monitor or log your browsing activity.
		</p>

		<h2>Contact</h2>
		<p>
			For privacy-related inquiries, contact us at
			<a href="mailto:hello@merorestaurant.com" class="text-primary">hello@merorestaurant.com</a>
			or visit us at Birendranagar, Surkhet, Nepal.
		</p>
	</div>
</section>
