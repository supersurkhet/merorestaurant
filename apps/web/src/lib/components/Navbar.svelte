<script lang="ts">
	import { t, locale, setLocale, type Locale } from '$i18n';
	import { toggleTheme, theme } from '$lib/theme';
	import { Sun, Moon, Menu, X, Globe, User } from 'lucide-svelte';
	import { page } from '$app/state';

	let mobileOpen = $state(false);
	const user = $derived(page.data?.user);
	let scrolled = $state(false);

	function handleScroll() {
		scrolled = typeof window !== 'undefined' && window.scrollY > 10;
	}

	function switchLang() {
		setLocale($locale === 'en' ? 'ne' : 'en');
	}

	const navLinks = [
		{ href: '/features', key: 'nav.features' },
		{ href: '/pricing', key: 'nav.pricing' },
		{ href: '/download', key: 'nav.download' },
		{ href: '/about', key: 'nav.about' }
	];
</script>

<svelte:window onscroll={handleScroll} />

<header
	class="fixed top-0 right-0 left-0 z-50 transition-all duration-300 {scrolled
		? 'border-b border-border bg-background/80 backdrop-blur-xl'
		: ''}"
>
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
		<a href="/" class="flex items-center gap-2.5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">M</div>
			<span class="text-[15px] font-semibold tracking-tight text-foreground">{$t('site.name')}</span>
		</a>

		<div class="hidden items-center gap-1 md:flex">
			{#each navLinks as link}
				<a
					href={link.href}
					class="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					{$t(link.key)}
				</a>
			{/each}
		</div>

		<div class="hidden items-center gap-2 md:flex">
			<button
				onclick={switchLang}
				class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				<Globe class="h-3.5 w-3.5" />
				{$t('lang.switch')}
			</button>
			<button
				onclick={toggleTheme}
				class="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Toggle theme"
			>
				{#if $theme === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</button>
			{#if user}
				<a href="/dashboard" class="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary/80">
					<User class="h-3.5 w-3.5" />
					{user.firstName || user.email}
				</a>
			{:else}
				<a href="/api/auth/login" class="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
					{$t('nav.login')}
				</a>
				<a href="/register" class="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
					{$t('nav.getStarted')}
				</a>
			{/if}
		</div>

		<button
			class="rounded-lg p-2 text-foreground md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle menu"
		>
			{#if mobileOpen}<X class="h-5 w-5" />{:else}<Menu class="h-5 w-5" />{/if}
		</button>
	</nav>

	{#if mobileOpen}
		<div class="border-t border-border bg-background px-5 pb-5 md:hidden">
			{#each navLinks as link}
				<a
					href={link.href}
					class="block rounded-lg py-2.5 text-sm font-medium text-foreground"
					onclick={() => (mobileOpen = false)}
				>{$t(link.key)}</a>
			{/each}
			<hr class="my-3 border-border" />
			<div class="flex items-center gap-3">
				<button onclick={switchLang} class="text-sm text-muted-foreground"><Globe class="mr-1 inline h-3.5 w-3.5" />{$t('lang.switch')}</button>
				<button onclick={toggleTheme} class="text-muted-foreground">
					{#if $theme === 'dark'}<Sun class="h-4 w-4" />{:else}<Moon class="h-4 w-4" />{/if}
				</button>
			</div>
			{#if user}
				<a href="/dashboard" class="mt-3 block rounded-lg bg-secondary py-2.5 text-center text-sm font-medium text-foreground">{$t('dashboard.title')}</a>
				<a href="/api/auth/logout" class="mt-2 block text-center text-sm text-muted-foreground">Log out</a>
			{:else}
				<a href="/register" class="mt-3 block rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground">{$t('nav.getStarted')}</a>
			{/if}
		</div>
	{/if}
</header>
