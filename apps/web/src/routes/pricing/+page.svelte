<script lang="ts">
	import { t } from '$i18n';
	import { Check, X, ChevronDown, ArrowRight } from 'lucide-svelte';

	let openFaq = $state<number | null>(null);

	const tiers = [
		{ tier: 'free', feats: 5, highlight: false },
		{ tier: 'starter', feats: 6, highlight: false },
		{ tier: 'pro', feats: 7, highlight: true },
		{ tier: 'enterprise', feats: 5, highlight: false }
	];

	const comparisonRows = [
		{ feature: 'Restaurants', free: '1', starter: '1', pro: '3', enterprise: 'Unlimited' },
		{ feature: 'Menu Items', free: '10', starter: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
		{ feature: 'Tables', free: '5', starter: '15', pro: 'Unlimited', enterprise: 'Unlimited' },
		{ feature: 'Orders/month', free: '50', starter: '500', pro: '5,000', enterprise: 'Unlimited' },
		{ feature: 'QR Table Codes', free: true, starter: true, pro: true, enterprise: true },
		{ feature: 'Digital Menu', free: true, starter: true, pro: true, enterprise: true },
		{ feature: 'Order Management', free: true, starter: true, pro: true, enterprise: true },
		{ feature: 'Kitchen Display', free: false, starter: true, pro: true, enterprise: true },
		{ feature: 'Digital Payments', free: false, starter: true, pro: true, enterprise: true },
		{ feature: 'Basic Analytics', free: false, starter: true, pro: true, enterprise: true },
		{ feature: 'Advanced Analytics', free: false, starter: false, pro: true, enterprise: true },
		{ feature: 'Staff Management', free: false, starter: false, pro: true, enterprise: true },
		{ feature: 'Custom Branding', free: false, starter: false, pro: true, enterprise: true },
		{ feature: 'Priority Support', free: false, starter: false, pro: true, enterprise: true },
		{ feature: 'Dedicated Account Mgr', free: false, starter: false, pro: false, enterprise: true },
		{ feature: 'Custom Integrations', free: false, starter: false, pro: false, enterprise: true },
		{ feature: 'SLA Guarantee', free: false, starter: false, pro: false, enterprise: true }
	];

	const faqKeys = ['pricing.faq.1', 'pricing.faq.2', 'pricing.faq.3'];
</script>

<svelte:head>
	<title>{$t('pricing.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto mb-14 max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('pricing.title')}</h1>
			<p class="mt-3 text-lg text-muted-foreground">{$t('pricing.subtitle')}</p>
		</div>

		<!-- Pricing Cards -->
		<div class="grid gap-4 lg:grid-cols-4">
			{#each tiers as plan}
				<div class="relative rounded-xl border bg-card p-6 {plan.highlight ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}">
					{#if plan.highlight}
						<span class="absolute -top-2.5 right-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold text-primary-foreground">{$t('pricing.pro.badge')}</span>
					{/if}
					<h3 class="text-[15px] font-semibold text-foreground">{$t(`pricing.${plan.tier}.name`)}</h3>
					<p class="mt-0.5 text-[12px] text-muted-foreground">{$t(`pricing.${plan.tier}.desc`)}</p>
					<div class="mt-4 flex items-baseline gap-1">
						<span class="text-3xl font-bold tracking-tight text-foreground">{$t(`pricing.${plan.tier}.price`)}</span>
						<span class="text-[12px] text-muted-foreground">{$t(`pricing.${plan.tier}.period`)}</span>
					</div>
					<a href="/register" class="mt-5 block w-full rounded-lg py-2.5 text-center text-[13px] font-medium transition-colors {plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border text-foreground hover:bg-secondary'}">
						{$t(`pricing.${plan.tier}.cta`)}
					</a>
					<ul class="mt-5 space-y-2">
						{#each Array(plan.feats) as _, i}
							<li class="flex items-center gap-2 text-[12px] text-muted-foreground">
								<Check class="h-3.5 w-3.5 shrink-0 text-primary" />
								{$t(`pricing.${plan.tier}.features.${i + 1}`)}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Feature Comparison Table -->
		<div class="mt-20">
			<h2 class="mb-8 text-center text-2xl font-bold text-foreground">Feature Comparison</h2>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-[13px]">
					<thead>
						<tr class="border-b border-border">
							<th class="py-3 pr-4 text-sm font-semibold text-foreground">Feature</th>
							{#each ['Free', 'Starter', 'Pro', 'Enterprise'] as name}
								<th class="px-4 py-3 text-center text-sm font-semibold text-foreground">{name}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each comparisonRows as row}
							<tr class="border-b border-border/50">
								<td class="py-3 pr-4 text-muted-foreground">{row.feature}</td>
								{#each ['free', 'starter', 'pro', 'enterprise'] as tier}
									{@const val = row[tier as keyof typeof row]}
									<td class="px-4 py-3 text-center">
										{#if val === true}
											<Check class="mx-auto h-4 w-4 text-primary" />
										{:else if val === false}
											<X class="mx-auto h-4 w-4 text-muted-foreground/30" />
										{:else}
											<span class="text-[13px] font-medium text-foreground">{val}</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- FAQ -->
		<div class="mt-20 mx-auto max-w-2xl">
			<h2 class="mb-8 text-center text-2xl font-bold text-foreground">{$t('pricing.faq.title')}</h2>
			{#each faqKeys as key, i}
				<div class="border-b border-border">
					<button
						class="flex w-full items-center justify-between py-4 text-left text-[14px] font-medium text-foreground"
						onclick={() => (openFaq = openFaq === i ? null : i)}
					>
						{$t(`${key}.q`)}
						<ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground transition-transform {openFaq === i ? 'rotate-180' : ''}" />
					</button>
					{#if openFaq === i}
						<p class="pb-4 text-[13px] leading-relaxed text-muted-foreground">{$t(`${key}.a`)}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
