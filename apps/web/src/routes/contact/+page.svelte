<script lang="ts">
	import { t } from '$i18n';
	import { Mail, Phone, MapPin } from 'lucide-svelte';
</script>

<svelte:head>
	<title>{$t('contact.title')} — {$t('site.name')}</title>
</svelte:head>

<section class="pt-32 pb-24">
	<div class="mx-auto max-w-4xl px-5">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-foreground">{$t('contact.title')}</h1>
			<p class="mt-3 text-lg text-muted-foreground">{$t('contact.subtitle')}</p>
		</div>

		<div class="grid gap-8 lg:grid-cols-2">
			<div class="space-y-6">
				{#each [
					{ icon: Mail, label: $t('contact.email'), href: 'mailto:hello@merorestaurant.com' },
					{ icon: Phone, label: $t('contact.phone'), href: 'tel:+977083520123' },
					{ icon: MapPin, label: $t('contact.address'), href: null }
				] as item}
					<div class="flex items-start gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<item.icon class="h-5 w-5 text-primary" />
						</div>
						<div>
							{#if item.href}
								<a href={item.href} class="text-[14px] font-medium text-foreground hover:text-primary">{item.label}</a>
							{:else}
								<p class="text-[14px] font-medium text-foreground">{item.label}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('contact.form.name')}</label>
					<input type="text" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('contact.form.email')}</label>
					<input type="email" class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
				</div>
				<div>
					<label class="mb-1 block text-[13px] font-medium text-foreground">{$t('contact.form.message')}</label>
					<textarea rows="5" class="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"></textarea>
				</div>
				<button class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
					{$t('contact.form.send')}
				</button>
			</form>
		</div>
	</div>
</section>
