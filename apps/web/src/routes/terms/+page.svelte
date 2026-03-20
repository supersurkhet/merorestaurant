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
		<p class="text-muted-foreground"><em>Last updated: March 2026</em></p>

		<h2>Acceptance of Terms</h2>
		<p>
			By accessing and using Mero Restaurant's website and mobile application, you accept and
			agree to be bound by these Terms of Service.
		</p>

		<h2>Orders and Payment</h2>
		<ul>
			<li>All prices are listed in Nepalese Rupees (NPR)</li>
			<li>Prices may change without prior notice</li>
			<li>We accept payments via Khalti, eSewa, Fonepay, and cash</li>
			<li>Orders are confirmed only after successful payment processing</li>
		</ul>

		<h2>Delivery</h2>
		<p>
			Delivery is available within Birendranagar, Surkhet. Delivery times are estimates and may
			vary based on order volume and conditions.
		</p>

		<h2>Cancellations and Refunds</h2>
		<p>
			Orders may be cancelled within 5 minutes of placement. Refunds for cancelled orders will
			be processed within 3-5 business days to the original payment method.
		</p>

		<h2>WiFi Terms of Use</h2>
		<p>
			Our complimentary WiFi service is provided for customer use during dining. Usage is
			subject to fair-use policies. Illegal activities are strictly prohibited.
		</p>

		<h2>Contact</h2>
		<p>
			Questions about these terms? Contact us at
			<a href="mailto:hello@merorestaurant.com" class="text-primary">hello@merorestaurant.com</a>.
		</p>
	</div>
</section>
