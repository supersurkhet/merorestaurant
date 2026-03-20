<script lang="ts">
	import { t } from '$i18n';
	import { Smartphone, Monitor, Apple, Download } from 'lucide-svelte';
</script>

<svelte:head>
	<title>{$t('download.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-4xl px-5">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('download.title')}</h1>
			<p class="mt-3 text-lg text-muted-foreground">{$t('download.subtitle')}</p>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Customer App -->
			<div class="rounded-2xl border border-border bg-card p-8">
				<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/30">
					<Smartphone class="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
				<h2 class="text-xl font-bold text-foreground">{$t('download.customer.title')}</h2>
				<p class="mt-2 text-[14px] leading-relaxed text-muted-foreground">{$t('download.customer.desc')}</p>
				<div class="mt-6 space-y-3">
					<a
						href="https://github.com/merorestaurant/app/releases/latest"
						target="_blank"
						rel="noopener noreferrer"
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
					>
						<Download class="h-4 w-4" />
						{$t('download.customer.android')}
					</a>
					<a
						href="https://testflight.apple.com/join/merorestaurant"
						target="_blank"
						rel="noopener noreferrer"
						class="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
					>
						<Apple class="h-4 w-4" />
						{$t('download.customer.ios')}
					</a>
				</div>
			</div>

			<!-- Admin Desktop App -->
			<div class="rounded-2xl border border-border bg-card p-8">
				<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/30">
					<Monitor class="h-6 w-6 text-purple-600 dark:text-purple-400" />
				</div>
				<h2 class="text-xl font-bold text-foreground">{$t('download.admin.title')}</h2>
				<p class="mt-2 text-[14px] leading-relaxed text-muted-foreground">{$t('download.admin.desc')}</p>
				<div class="mt-6 space-y-3">
					{#each [
						{ label: 'download.admin.windows', ext: '.exe' },
						{ label: 'download.admin.macos', ext: '.dmg' },
						{ label: 'download.admin.linux', ext: '.AppImage' }
					] as platform}
						<a
							href="https://github.com/merorestaurant/desktop/releases/latest"
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
						>
							<Download class="h-4 w-4" />
							{$t(platform.label)}
						</a>
					{/each}
				</div>
				<p class="mt-4 text-center text-[12px] text-muted-foreground">{$t('download.admin.note')}</p>
			</div>
		</div>
	</div>
</section>
