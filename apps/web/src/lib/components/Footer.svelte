<script lang="ts">
	import { t } from '$i18n';
</script>

<footer class="border-t border-border bg-card">
	<div class="mx-auto max-w-6xl px-5 py-14">
		<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
			<div class="lg:col-span-1">
				<div class="mb-3 flex items-center gap-2.5">
					<div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">M</div>
					<span class="text-sm font-semibold text-foreground">{$t('site.name')}</span>
				</div>
				<p class="text-[13px] leading-relaxed text-muted-foreground">{$t('footer.tagline')}</p>
			</div>

			<div>
				<h4 class="mb-3 text-[13px] font-semibold text-foreground">{$t('footer.product')}</h4>
				<div class="space-y-2 text-[13px] text-muted-foreground">
					<a href="/features" class="block transition-colors hover:text-foreground">{$t('nav.features')}</a>
					<a href="/pricing" class="block transition-colors hover:text-foreground">{$t('nav.pricing')}</a>
					<a href="/download" class="block transition-colors hover:text-foreground">{$t('nav.download')}</a>
				</div>
			</div>

			<div>
				<h4 class="mb-3 text-[13px] font-semibold text-foreground">{$t('footer.company')}</h4>
				<div class="space-y-2 text-[13px] text-muted-foreground">
					<a href="/about" class="block transition-colors hover:text-foreground">{$t('nav.about')}</a>
					<a href="/contact" class="block transition-colors hover:text-foreground">{$t('nav.contact')}</a>
				</div>
			</div>

			<div>
				<h4 class="mb-3 text-[13px] font-semibold text-foreground">{$t('footer.legal')}</h4>
				<div class="space-y-2 text-[13px] text-muted-foreground">
					<a href="/privacy" class="block transition-colors hover:text-foreground">{$t('footer.privacy')}</a>
					<a href="/terms" class="block transition-colors hover:text-foreground">{$t('footer.terms')}</a>
				</div>
			</div>
		</div>

		<div class="mt-10 border-t border-border pt-6">
			<p class="text-[12px] text-muted-foreground">&copy; {new Date().getFullYear()} {$t('footer.copyright')}</p>
		</div>
	</div>
</footer>
