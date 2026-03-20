<script lang="ts">
	import { t } from '$i18n';
	import { Check, ArrowRight, ChevronDown } from 'lucide-svelte';

	const freeFeatKeys = ['pricing.free.features.1','pricing.free.features.2','pricing.free.features.3','pricing.free.features.4','pricing.free.features.5','pricing.free.features.6'];
	const proFeatKeys = ['pricing.pro.features.1','pricing.pro.features.2','pricing.pro.features.3','pricing.pro.features.4','pricing.pro.features.5','pricing.pro.features.6','pricing.pro.features.7','pricing.pro.features.8'];
	const faqKeys = ['pricing.faq.1','pricing.faq.2','pricing.faq.3'];

	let openFaq = $state<number | null>(null);
</script>

<svelte:head>
	<title>{$t('pricing.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-5xl px-5">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('pricing.title')}</h1>
			<p class="mt-3 text-lg text-muted-foreground">{$t('pricing.subtitle')}</p>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Free -->
			<div class="rounded-2xl border border-border bg-card p-8">
				<h3 class="text-lg font-semibold text-foreground">{$t('pricing.free.name')}</h3>
				<p class="mt-1 text-[13px] text-muted-foreground">{$t('pricing.free.desc')}</p>
				<div class="mt-6 flex items-baseline gap-1">
					<span class="text-4xl font-bold tracking-tight text-foreground">{$t('pricing.free.price')}</span>
					<span class="text-sm text-muted-foreground">{$t('pricing.free.period')}</span>
				</div>
				<a href="/register" class="mt-6 block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary">
					{$t('pricing.free.cta')}
				</a>
				<ul class="mt-8 space-y-3">
					{#each freeFeatKeys as key}
						<li class="flex items-center gap-2.5 text-[13px] text-muted-foreground">
							<Check class="h-4 w-4 shrink-0 text-primary" />
							{$t(key)}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Pro -->
			<div class="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-lg shadow-primary/10">
				<span class="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground">{$t('pricing.pro.badge')}</span>
				<h3 class="text-lg font-semibold text-foreground">{$t('pricing.pro.name')}</h3>
				<p class="mt-1 text-[13px] text-muted-foreground">{$t('pricing.pro.desc')}</p>
				<div class="mt-6 flex items-baseline gap-1">
					<span class="text-4xl font-bold tracking-tight text-foreground">{$t('pricing.pro.price')}</span>
					<span class="text-sm text-muted-foreground">{$t('pricing.pro.period')}</span>
				</div>
				<a href="/register" class="mt-6 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90">
					{$t('pricing.pro.cta')}
				</a>
				<ul class="mt-8 space-y-3">
					{#each proFeatKeys as key}
						<li class="flex items-center gap-2.5 text-[13px] text-muted-foreground">
							<Check class="h-4 w-4 shrink-0 text-primary" />
							{$t(key)}
						</li>
					{/each}
				</ul>
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
