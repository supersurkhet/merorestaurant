<script lang="ts">
	import { t } from '$i18n';
	import {
		QrCode, ClipboardList, MonitorSmartphone, CreditCard, BarChart3, Languages,
		ArrowRight, Check, Zap, Shield, Clock, UserPlus, UtensilsCrossed, Tablet, Rocket
	} from 'lucide-svelte';

	const features = [
		{ icon: QrCode, titleKey: 'features.qr.title', descKey: 'features.qr.desc' },
		{ icon: ClipboardList, titleKey: 'features.orders.title', descKey: 'features.orders.desc' },
		{ icon: MonitorSmartphone, titleKey: 'features.kitchen.title', descKey: 'features.kitchen.desc' },
		{ icon: CreditCard, titleKey: 'features.payments.title', descKey: 'features.payments.desc' },
		{ icon: BarChart3, titleKey: 'features.analytics.title', descKey: 'features.analytics.desc' },
		{ icon: Languages, titleKey: 'features.multilang.title', descKey: 'features.multilang.desc' }
	];

	const steps = [
		{ num: '01', icon: UserPlus, key: 'howItWorks.1' },
		{ num: '02', icon: UtensilsCrossed, key: 'howItWorks.2' },
		{ num: '03', icon: Tablet, key: 'howItWorks.3' },
		{ num: '04', icon: Rocket, key: 'howItWorks.4' }
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
<section class="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute -top-48 -right-24 h-[700px] w-[700px] rounded-full bg-primary/[0.04] blur-3xl"></div>
		<div class="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl"></div>
	</div>

	<div class="relative mx-auto max-w-6xl px-5">
		<div class="mx-auto max-w-3xl text-center">
			<div class="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[13px] font-medium text-primary">
				<Zap class="h-3.5 w-3.5" />
				{$t('hero.trust')}
			</div>

			<h1 class="animate-slide-up text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-foreground">
				{$t('hero.title')}
				<span class="block text-primary">{$t('hero.titleHighlight')}</span>
			</h1>

			<p class="animate-slide-up mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground" style="animation-delay:.1s">
				{$t('hero.subtitle')}
			</p>

			<div class="animate-slide-up mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" style="animation-delay:.2s">
				<a href="/register" class="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25">
					{$t('hero.cta')}
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
				<a href="/download" class="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary">
					{$t('nav.download')}
				</a>
			</div>

			<div class="animate-slide-up mt-14 flex justify-center divide-x divide-border" style="animation-delay:.3s">
				{#each [{ v: '50+', k: 'hero.stat.restaurants' }, { v: '10K+', k: 'hero.stat.orders' }, { v: '99.9%', k: 'hero.stat.uptime' }] as stat}
					<div class="px-8 text-center">
						<p class="text-2xl font-bold tracking-tight text-foreground">{stat.v}</p>
						<p class="mt-0.5 text-[12px] text-muted-foreground">{$t(stat.k)}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Dashboard Preview -->
		<div class="mt-20 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/[0.04] dark:shadow-black/20">
			<div class="flex items-center gap-2 border-b border-border px-5 py-3">
				<div class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></div>
				<div class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></div>
				<div class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></div>
				<span class="ml-4 text-[11px] font-medium text-muted-foreground tracking-wide">merorestaurant — Dashboard</span>
			</div>
			<div class="grid grid-cols-5 gap-px bg-border">
				<div class="col-span-1 bg-card/80 p-4">
					{#each ['Orders', 'Menu', 'Tables', 'Kitchen', 'Analytics', 'Staff', 'Settings'] as item, i}
						<div class="rounded-md px-3 py-1.5 text-[11px] {i === 0 ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground/80'}">{item}</div>
					{/each}
				</div>
				<div class="col-span-4 bg-card p-6">
					<div class="mb-5 flex items-center justify-between">
						<div>
							<div class="text-[13px] font-semibold text-foreground">Today's Orders</div>
							<div class="text-[11px] text-muted-foreground">12 active · 47 completed</div>
						</div>
						<div class="rounded-lg bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">Rs. 48,750</div>
					</div>
					<div class="space-y-2">
						{#each [
							{ num: 'ORD-0321-047', st: 'Preparing', tbl: 'Table 3', amt: 'Rs. 1,250', c: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
							{ num: 'ORD-0321-046', st: 'Ready', tbl: 'Table 7', amt: 'Rs. 890', c: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
							{ num: 'ORD-0321-045', st: 'Placed', tbl: 'Takeaway', amt: 'Rs. 2,100', c: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' }
						] as o}
							<div class="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
								<div class="flex items-center gap-4">
									<span class="font-mono text-[11px] font-medium text-foreground">{o.num}</span>
									<span class="text-[11px] text-muted-foreground">{o.tbl}</span>
								</div>
								<div class="flex items-center gap-3">
									<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {o.c}">{o.st}</span>
									<span class="text-[11px] font-medium text-foreground">{o.amt}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="border-t border-border bg-muted/30 py-24">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto mb-14 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">{$t('features.title')}</h2>
			<p class="mt-3 text-muted-foreground">{$t('features.subtitle')}</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as f}
				<div class="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
					<div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<f.icon class="h-5 w-5 text-primary" />
					</div>
					<h3 class="mb-1 text-[15px] font-semibold text-foreground">{$t(f.titleKey)}</h3>
					<p class="text-[13px] leading-relaxed text-muted-foreground">{$t(f.descKey)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How It Works -->
<section class="py-24">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto mb-14 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">{$t('howItWorks.title')}</h2>
			<p class="mt-3 text-muted-foreground">{$t('howItWorks.subtitle')}</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step}
				<div class="relative rounded-xl border border-border bg-card p-6">
					<span class="text-[40px] font-extrabold leading-none text-primary/10">{step.num}</span>
					<div class="mt-2 mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<step.icon class="h-5 w-5 text-primary" />
					</div>
					<h3 class="text-[15px] font-semibold text-foreground">{$t(`${step.key}.title`)}</h3>
					<p class="mt-1 text-[13px] text-muted-foreground">{$t(`${step.key}.desc`)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Pricing -->
<section class="border-t border-border bg-muted/30 py-24">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mx-auto mb-14 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">{$t('pricing.title')}</h2>
			<p class="mt-3 text-muted-foreground">{$t('pricing.subtitle')}</p>
		</div>
		<div class="grid gap-4 lg:grid-cols-4">
			{#each [
				{ tier: 'free', feats: 5, highlight: false },
				{ tier: 'starter', feats: 6, highlight: false },
				{ tier: 'pro', feats: 7, highlight: true },
				{ tier: 'enterprise', feats: 5, highlight: false }
			] as plan}
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
					<a href="/register" class="mt-5 block w-full rounded-lg py-2 text-center text-[13px] font-medium transition-colors {plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border text-foreground hover:bg-secondary'}">
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
	</div>
</section>

<!-- Testimonials -->
<section class="py-24">
	<div class="mx-auto max-w-6xl px-5">
		<h2 class="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">Why Owners Switch</h2>
		<div class="grid gap-6 sm:grid-cols-3">
			{#each [
				{ quote: 'We went from paper tickets to real-time kitchen displays in one afternoon. Orders never get lost anymore.', name: 'Ram B.', role: 'Surkhet' },
				{ quote: 'The QR menu saves us so much time. Customers order themselves and we just cook. Revenue is up 30%.', name: 'Sita K.', role: 'Birendranagar' },
				{ quote: 'Finally a system that understands Nepali restaurants — Khalti payments, VAT, bilingual menus, everything.', name: 'Krishna T.', role: 'Nepalgunj' }
			] as t}
				<div class="rounded-xl border border-border bg-card p-6">
					<p class="text-[13px] leading-relaxed text-muted-foreground italic">"{t.quote}"</p>
					<div class="mt-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[12px] font-semibold text-primary">{t.name[0]}</div>
						<div>
							<p class="text-[13px] font-medium text-foreground">{t.name}</p>
							<p class="text-[11px] text-muted-foreground">{t.role}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA -->
<section class="border-t border-border bg-muted/30 py-20">
	<div class="mx-auto max-w-2xl px-5 text-center">
		<h2 class="text-3xl font-bold tracking-tight text-foreground">{$t('hero.cta')}</h2>
		<p class="mt-3 text-muted-foreground">{$t('register.subtitle')}</p>
		<a href="/register" class="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20">
			{$t('nav.getStarted')}
			<ArrowRight class="h-4 w-4" />
		</a>
	</div>
</section>
