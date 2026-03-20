<script lang="ts">
	import { t } from '$i18n';
	import { MapPin, Phone, Mail, Clock } from 'lucide-svelte';
</script>

<footer class="border-t border-border bg-card">
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
		<div class="grid gap-12 md:grid-cols-4">
			<div class="md:col-span-1">
				<div class="mb-4 flex items-center gap-2">
					<span class="text-2xl">🍛</span>
					<span class="font-[var(--font-display)] text-lg font-bold text-foreground">
						{$t('site.name')}
					</span>
				</div>
				<p class="text-sm leading-relaxed text-muted-foreground">
					{$t('site.description')}
				</p>
			</div>

			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-foreground uppercase">
					{$t('info.hours')}
				</h3>
				<div class="space-y-3 text-sm text-muted-foreground">
					<div class="flex items-start gap-2">
						<Clock class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
						<div>
							<p>{$t('info.hours.weekday')}</p>
							<p>{$t('info.hours.saturday')}</p>
						</div>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-foreground uppercase">
					{$t('nav.contact')}
				</h3>
				<div class="space-y-3 text-sm text-muted-foreground">
					<div class="flex items-start gap-2">
						<MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
						<span>{$t('info.address')}</span>
					</div>
					<div class="flex items-center gap-2">
						<Phone class="h-4 w-4 shrink-0 text-primary" />
						<a href="tel:+977083520123" class="hover:text-primary">{$t('info.phone')}</a>
					</div>
					<div class="flex items-center gap-2">
						<Mail class="h-4 w-4 shrink-0 text-primary" />
						<a href="mailto:hello@merorestaurant.com" class="hover:text-primary"
							>{$t('info.email')}</a
						>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wider text-foreground uppercase">
					Links
				</h3>
				<div class="space-y-3 text-sm text-muted-foreground">
					<a href="/menu" class="block hover:text-primary">{$t('nav.menu')}</a>
					<a href="/about" class="block hover:text-primary">{$t('nav.about')}</a>
					<a href="/privacy" class="block hover:text-primary">{$t('footer.privacy')}</a>
					<a href="/terms" class="block hover:text-primary">{$t('footer.terms')}</a>
				</div>
			</div>
		</div>

		<div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
			<p class="text-sm text-muted-foreground">
				&copy; {new Date().getFullYear()} {$t('footer.copyright')}
			</p>
			<div class="flex gap-6 text-sm text-muted-foreground">
				<a href="/privacy" class="hover:text-primary">{$t('footer.privacy')}</a>
				<a href="/terms" class="hover:text-primary">{$t('footer.terms')}</a>
			</div>
		</div>
	</div>
</footer>
