<script lang="ts">
	import { t } from '$i18n';
</script>

<svelte:head>
	<title>{$t('terms.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="prose prose-gray dark:prose-invert mx-auto max-w-3xl px-5">
		<h1>{$t('terms.title')}</h1>
		<p><em>Last updated: March 2026</em></p>
		<h2>Service</h2>
		<p>Mero Restaurant provides a restaurant management platform including digital menus, order management, payment processing, and analytics tools.</p>
		<h2>Accounts</h2>
		<p>You are responsible for maintaining the security of your account. Each restaurant account should be managed by authorized staff only.</p>
		<h2>Pricing</h2>
		<p>The Starter plan is free forever. Pro plan pricing is listed on our pricing page and may change with 30 days notice. All prices are in Nepalese Rupees (NPR).</p>
		<h2>Payment Processing</h2>
		<p>We integrate with Khalti, eSewa, and Fonepay for customer payments. Transaction fees from these providers are separate from our subscription fees.</p>
		<h2>Termination</h2>
		<p>You may close your account at any time. We may terminate accounts that violate these terms or engage in fraudulent activity.</p>
		<h2>Contact</h2>
		<p>Questions? Contact us at <a href="mailto:hello@merorestaurant.com" class="text-primary">hello@merorestaurant.com</a>.</p>
	</div>
</section>
