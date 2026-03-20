<script lang="ts">
	import { t } from '$i18n';
	import { Heart, Shield, Users, Utensils } from 'lucide-svelte';

	const values = [
		{ icon: Utensils, key: 'about.values.quality' },
		{ icon: Heart, key: 'about.values.tradition' },
		{ icon: Users, key: 'about.values.community' },
		{ icon: Shield, key: 'about.values.hospitality' }
	];
</script>

<svelte:head>
	<title>{$t('about.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="bg-gradient-to-b from-orange-950 to-background pt-32 pb-12">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6">
		<h1 class="font-[var(--font-display)] text-5xl font-bold text-white">
			{$t('about.title')}
		</h1>
	</div>
</section>

<section class="bg-background py-16">
	<div class="mx-auto max-w-3xl px-4 sm:px-6">
		<div class="prose prose-lg dark:prose-invert mx-auto">
			<p class="text-lg leading-relaxed text-muted-foreground">
				{$t('about.p1')}
			</p>
			<p class="mt-6 text-lg leading-relaxed text-muted-foreground">
				{$t('about.p2')}
			</p>
		</div>

		<div class="mt-16 rounded-2xl border border-border bg-card p-8">
			<h2 class="font-[var(--font-display)] text-2xl font-bold text-foreground">
				{$t('about.mission.title')}
			</h2>
			<p class="mt-4 leading-relaxed text-muted-foreground">
				{$t('about.mission.desc')}
			</p>
		</div>

		<div class="mt-12">
			<h2 class="mb-8 font-[var(--font-display)] text-2xl font-bold text-foreground">
				{$t('about.values.title')}
			</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each values as value}
					<div class="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"
						>
							<value.icon class="h-5 w-5 text-primary" />
						</div>
						<p class="text-sm font-medium text-foreground">{$t(value.key)}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
