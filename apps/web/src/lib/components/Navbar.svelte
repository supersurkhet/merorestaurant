<script lang="ts">
	import { t, locale, setLocale, type Locale } from '$i18n';
	import { toggleTheme, theme } from '$lib/theme';
	import { Sun, Moon, Menu, X, Globe } from 'lucide-svelte';

	let mobileOpen = $state(false);
	let scrolled = $state(false);

	function handleScroll() {
		scrolled = typeof window !== 'undefined' && window.scrollY > 20;
	}

	function switchLang() {
		const next: Locale = $locale === 'en' ? 'ne' : 'en';
		setLocale(next);
	}

	const navLinks = [
		{ href: '/', key: 'nav.home' },
		{ href: '/menu', key: 'nav.menu' },
		{ href: '/about', key: 'nav.about' },
		{ href: '/#contact', key: 'nav.contact' }
	];
</script>

<svelte:window onscroll={handleScroll} />

<nav
	class="fixed top-0 right-0 left-0 z-50 transition-all duration-300 {scrolled
		? 'bg-background/95 shadow-lg backdrop-blur-md'
		: 'bg-transparent'}"
>
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
		<a href="/" class="flex items-center gap-2">
			<span class="text-2xl">🍛</span>
			<span
				class="font-[var(--font-display)] text-xl font-bold {scrolled
					? 'text-foreground'
					: 'text-white'}"
			>
				{$t('site.name')}
			</span>
		</a>

		<div class="hidden items-center gap-8 md:flex">
			{#each navLinks as link}
				<a
					href={link.href}
					class="text-sm font-medium transition-colors hover:text-primary {scrolled
						? 'text-foreground/80'
						: 'text-white/90'}"
				>
					{$t(link.key)}
				</a>
			{/each}

			<button
				onclick={switchLang}
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors {scrolled
					? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
					: 'bg-white/15 text-white hover:bg-white/25'}"
			>
				<Globe class="h-3.5 w-3.5" />
				{$t('lang.switch')}
			</button>

			<button
				onclick={toggleTheme}
				class="rounded-full p-2 transition-colors {scrolled
					? 'text-foreground/70 hover:bg-secondary'
					: 'text-white/80 hover:bg-white/15'}"
				aria-label="Toggle theme"
			>
				{#if $theme === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</button>

			<a
				href="/menu"
				class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
			>
				{$t('nav.download')}
			</a>
		</div>

		<button
			class="rounded-lg p-2 md:hidden {scrolled ? 'text-foreground' : 'text-white'}"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle menu"
		>
			{#if mobileOpen}
				<X class="h-6 w-6" />
			{:else}
				<Menu class="h-6 w-6" />
			{/if}
		</button>
	</div>

	{#if mobileOpen}
		<div class="border-t border-border bg-background px-4 py-4 shadow-xl md:hidden">
			<div class="flex flex-col gap-3">
				{#each navLinks as link}
					<a
						href={link.href}
						class="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
						onclick={() => (mobileOpen = false)}
					>
						{$t(link.key)}
					</a>
				{/each}
				<hr class="border-border" />
				<div class="flex items-center justify-between px-4">
					<button
						onclick={switchLang}
						class="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
					>
						<Globe class="h-4 w-4" />
						{$t('lang.switch')}
					</button>
					<button
						onclick={toggleTheme}
						class="rounded-full p-2 text-muted-foreground hover:bg-secondary"
						aria-label="Toggle theme"
					>
						{#if $theme === 'dark'}
							<Sun class="h-4 w-4" />
						{:else}
							<Moon class="h-4 w-4" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
</nav>
