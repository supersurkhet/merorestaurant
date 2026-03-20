<script lang="ts">
	import { t } from '$i18n';
	import { MapPin, Globe, Heart } from 'lucide-svelte';

	const values = [
		{ icon: MapPin, titleKey: 'about.values.1.title', descKey: 'about.values.1.desc' },
		{ icon: Heart, titleKey: 'about.values.2.title', descKey: 'about.values.2.desc' },
		{ icon: Globe, titleKey: 'about.values.3.title', descKey: 'about.values.3.desc' }
	];
</script>

<svelte:head>
	<title>{$t('about.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-3xl px-5">
		<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('about.title')}</h1>
		<p class="mt-6 text-lg leading-relaxed text-muted-foreground">{$t('about.mission')}</p>
		<p class="mt-4 text-[15px] leading-relaxed text-muted-foreground">{$t('about.story')}</p>

		<h2 class="mt-16 text-2xl font-bold text-foreground">{$t('about.values.title')}</h2>
		<div class="mt-8 grid gap-6 sm:grid-cols-3">
			{#each values as val}
				<div class="rounded-xl border border-border bg-card p-6">
					<val.icon class="mb-3 h-5 w-5 text-primary" />
					<h3 class="mb-1.5 text-[15px] font-semibold text-foreground">{$t(val.titleKey)}</h3>
					<p class="text-[13px] leading-relaxed text-muted-foreground">{$t(val.descKey)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
