<script lang="ts">
	import { t } from '$i18n';
	import { Mail, Phone, MapPin } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
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
					<Label for="contact-name">{$t('contact.form.name')}</Label>
					<Input id="contact-name" type="text" />
				</div>
				<div>
					<Label for="contact-email">{$t('contact.form.email')}</Label>
					<Input id="contact-email" type="email" />
				</div>
				<div>
					<Label for="contact-msg">{$t('contact.form.message')}</Label>
					<Textarea id="contact-msg" rows={5} />
				</div>
				<Button class="w-full">
					{$t('contact.form.send')}
				</Button>
			</form>
		</div>
	</div>
</section>
