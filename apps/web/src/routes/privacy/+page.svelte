<script lang="ts">
	import { t } from '$i18n';
</script>

<svelte:head>
	<title>{$t('privacy.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="prose prose-gray dark:prose-invert mx-auto max-w-3xl px-5">
		<h1>{$t('privacy.title')}</h1>
		<p><em>Last updated: March 2026</em></p>
		<h2>Data Collection</h2>
		<p>We collect restaurant owner information (name, email, phone) during registration, restaurant details (name, address, menu), and order/payment data processed through the platform.</p>
		<h2>How We Use Data</h2>
		<p>Your data is used to provide the restaurant management service, process orders and payments, generate analytics, and communicate service updates.</p>
		<h2>Data Security</h2>
		<p>All data is stored securely on Convex with encryption at rest. Payment processing is handled by third-party providers (Khalti, eSewa, Fonepay) — we do not store payment credentials.</p>
		<h2>Data Sharing</h2>
		<p>We do not sell or share your data with third parties except as required to provide the service (payment processors) or comply with legal obligations.</p>
		<h2>Contact</h2>
		<p>For privacy inquiries, contact us at <a href="mailto:hello@merorestaurant.com" class="text-primary">hello@merorestaurant.com</a>.</p>
	</div>
</section>
