<script lang="ts">
	import { t } from '$i18n';
	import { QrCode, UtensilsCrossed, ClipboardList, CreditCard, BarChart3, Monitor, Check } from 'lucide-svelte';

	const sections = [
		{ icon: QrCode, titleKey: 'features.detail.qr.title', bullets: ['features.detail.qr.bullets.1','features.detail.qr.bullets.2','features.detail.qr.bullets.3','features.detail.qr.bullets.4'] },
		{ icon: UtensilsCrossed, titleKey: 'features.detail.menu.title', bullets: ['features.detail.menu.bullets.1','features.detail.menu.bullets.2','features.detail.menu.bullets.3','features.detail.menu.bullets.4'] },
		{ icon: ClipboardList, titleKey: 'features.detail.orders.title', bullets: ['features.detail.orders.bullets.1','features.detail.orders.bullets.2','features.detail.orders.bullets.3','features.detail.orders.bullets.4'] },
		{ icon: CreditCard, titleKey: 'features.detail.payments.title', bullets: ['features.detail.payments.bullets.1','features.detail.payments.bullets.2','features.detail.payments.bullets.3','features.detail.payments.bullets.4'] },
		{ icon: BarChart3, titleKey: 'features.detail.analytics.title', bullets: ['features.detail.analytics.bullets.1','features.detail.analytics.bullets.2','features.detail.analytics.bullets.3','features.detail.analytics.bullets.4'] },
		{ icon: Monitor, titleKey: 'features.detail.desktop.title', bullets: ['features.detail.desktop.bullets.1','features.detail.desktop.bullets.2','features.detail.desktop.bullets.3','features.detail.desktop.bullets.4'] }
	];
</script>

<svelte:head>
	<title>{$t('features.page.title')} — {$t('site.name')}</title>
	<meta name="description" content={$t('features.page.subtitle')} />
</svelte:head>

<section class="pt-32 pb-20">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('features.page.title')}</h1>
			<p class="mt-4 text-lg text-muted-foreground">{$t('features.page.subtitle')}</p>
		</div>

		<div class="space-y-6">
			{#each sections as section, i}
				<div class="grid items-start gap-8 rounded-2xl border border-border bg-card p-8 lg:grid-cols-2 lg:p-10">
					<div>
						<div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<section.icon class="h-5 w-5 text-primary" />
						</div>
						<h2 class="text-xl font-bold text-foreground">{$t(section.titleKey)}</h2>
					</div>
					<ul class="space-y-3">
						{#each section.bullets as bullet}
							<li class="flex items-start gap-3">
								<Check class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								<span class="text-[14px] leading-relaxed text-muted-foreground">{$t(bullet)}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>
