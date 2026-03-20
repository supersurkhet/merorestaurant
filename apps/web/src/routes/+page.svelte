<script lang="ts">
	import { t } from '$i18n';
	import {
		QrCode,
		ClipboardList,
		MonitorSmartphone,
		CreditCard,
		BarChart3,
		Languages,
		ArrowRight,
		Check,
		Zap,
		Shield,
		Clock
	} from 'lucide-svelte';

	const features = [
		{ icon: QrCode, titleKey: 'features.qr.title', descKey: 'features.qr.desc' },
		{ icon: ClipboardList, titleKey: 'features.orders.title', descKey: 'features.orders.desc' },
		{ icon: MonitorSmartphone, titleKey: 'features.kitchen.title', descKey: 'features.kitchen.desc' },
		{ icon: CreditCard, titleKey: 'features.payments.title', descKey: 'features.payments.desc' },
		{ icon: BarChart3, titleKey: 'features.analytics.title', descKey: 'features.analytics.desc' },
		{ icon: Languages, titleKey: 'features.multilang.title', descKey: 'features.multilang.desc' }
	];

	const stats = [
		{ value: '50+', key: 'hero.stat.restaurants' },
		{ value: '10K+', key: 'hero.stat.orders' },
		{ value: '99.9%', key: 'hero.stat.uptime' }
	];
</script>

<svelte:head>
	<title>{$t('site.name')} — {$t('site.tagline')}</title>
	<meta name="description" content={$t('site.description')} />
	<meta property="og:title" content="{$t('site.name')} — {$t('site.tagline')}" />
	<meta property="og:description" content={$t('site.description')} />
	<meta property="og:type" content="website" />
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl"></div>
	</div>

	<div class="relative mx-auto max-w-6xl px-5">
		<div class="mx-auto max-w-3xl text-center">
			<div class="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[13px] text-muted-foreground">
				<Zap class="h-3.5 w-3.5 text-primary" />
				{$t('hero.trust')}
			</div>

			<h1 class="animate-slide-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style="line-height: 1.1">
				{$t('hero.title')}
				<br />
				<span class="text-primary">{$t('hero.titleHighlight')}</span>
			</h1>

			<p class="animate-slide-up mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl" style="animation-delay: 0.1s">
				{$t('hero.subtitle')}
			</p>

			<div class="animate-slide-up mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" style="animation-delay: 0.2s">
				<a
					href="/register"
					class="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
				>
					{$t('hero.cta')}
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
				<a
					href="/features"
					class="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary"
				>
					{$t('hero.ctaSecondary')}
				</a>
			</div>

			<!-- Stats -->
			<div class="animate-slide-up mt-16 flex justify-center gap-12" style="animation-delay: 0.3s">
				{#each stats as stat}
					<div class="text-center">
						<p class="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
						<p class="mt-0.5 text-[13px] text-muted-foreground">{$t(stat.key)}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Product Preview -->
		<div class="mt-20 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 dark:shadow-black/20">
			<div class="flex items-center gap-2 border-b border-border px-4 py-3">
				<div class="h-3 w-3 rounded-full bg-red-400/60"></div>
				<div class="h-3 w-3 rounded-full bg-yellow-400/60"></div>
				<div class="h-3 w-3 rounded-full bg-green-400/60"></div>
				<span class="ml-3 text-[12px] text-muted-foreground">Mero Restaurant — Dashboard</span>
			</div>
			<div class="grid grid-cols-4 gap-px bg-border">
				<div class="col-span-1 bg-card p-4">
					<div class="space-y-2">
						{#each ['Orders', 'Menu', 'Tables', 'Kitchen', 'Analytics', 'Settings'] as item}
							<div class="rounded-md px-3 py-1.5 text-[12px] {item === 'Orders' ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'}">{item}</div>
						{/each}
					</div>
				</div>
				<div class="col-span-3 bg-card p-6">
					<div class="mb-4 flex items-center justify-between">
						<div>
							<div class="text-sm font-semibold text-foreground">Today's Orders</div>
							<div class="text-[12px] text-muted-foreground">12 active, 47 completed</div>
						</div>
						<div class="rounded-lg bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary">Rs. 48,750</div>
					</div>
					<div class="space-y-2">
						{#each [
							{ num: 'ORD-047', status: 'Preparing', table: 'Table 3', amount: 'Rs. 1,250', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400' },
							{ num: 'ORD-046', status: 'Ready', table: 'Table 7', amount: 'Rs. 890', color: 'text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400' },
							{ num: 'ORD-045', status: 'Placed', table: 'Table 1', amount: 'Rs. 2,100', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' }
						] as order}
							<div class="flex items-center justify-between rounded-lg border border-border px-4 py-3">
								<div class="flex items-center gap-4">
									<span class="font-mono text-[12px] font-medium text-foreground">{order.num}</span>
									<span class="text-[12px] text-muted-foreground">{order.table}</span>
								</div>
								<div class="flex items-center gap-3">
									<span class="rounded-full px-2.5 py-0.5 text-[11px] font-medium {order.color}">{order.status}</span>
									<span class="text-[12px] font-medium text-foreground">{order.amount}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Grid -->
<section class="border-t border-border bg-muted/30 py-24">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">{$t('features.title')}</h2>
			<p class="mt-3 text-lg text-muted-foreground">{$t('features.subtitle')}</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div class="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
					<div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<feature.icon class="h-5 w-5 text-primary" />
					</div>
					<h3 class="mb-1.5 text-[15px] font-semibold text-foreground">{$t(feature.titleKey)}</h3>
					<p class="text-[13px] leading-relaxed text-muted-foreground">{$t(feature.descKey)}</p>
				</div>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<a href="/features" class="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
				{$t('common.learnMore')}
				<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
			</a>
		</div>
	</div>
</section>

<!-- Social Proof -->
<section class="py-24">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto max-w-3xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">Why Restaurant Owners Switch</h2>
			<div class="mt-12 grid gap-6 sm:grid-cols-3">
				{#each [
					{ icon: Clock, title: '5 min setup', desc: 'Create your restaurant, add your menu, and go live in under five minutes.' },
					{ icon: Shield, title: 'Nepal-first', desc: 'Khalti, eSewa, Fonepay, VAT calculation, bilingual — built for how Nepal works.' },
					{ icon: Zap, title: 'Real-time', desc: 'Orders appear on your kitchen screen the moment a customer places them.' }
				] as item}
					<div class="rounded-xl border border-border bg-card p-6 text-left">
						<item.icon class="mb-3 h-5 w-5 text-primary" />
						<h3 class="mb-1 text-[15px] font-semibold text-foreground">{item.title}</h3>
						<p class="text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="border-t border-border bg-muted/30 py-20">
	<div class="mx-auto max-w-2xl px-5 text-center">
		<h2 class="text-3xl font-bold tracking-tight text-foreground">{$t('hero.cta')}</h2>
		<p class="mt-3 text-muted-foreground">No credit card required. Free tier available forever.</p>
		<div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<a
				href="/register"
				class="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20"
			>
				{$t('nav.getStarted')}
				<ArrowRight class="h-4 w-4" />
			</a>
			<a href="/pricing" class="inline-flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground">
				{$t('nav.pricing')}
				<ArrowRight class="h-3.5 w-3.5" />
			</a>
		</div>
	</div>
</section>
