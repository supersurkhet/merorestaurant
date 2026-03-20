<script lang="ts">
	import { t, locale, setLocale } from '$i18n';
	import { toggleTheme, theme } from '$lib/theme';
	import { Sun, Moon, Menu, X, Globe, User } from 'lucide-svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

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
			<Button variant="ghost" size="sm" onclick={switchLang}>
				<Globe class="h-3.5 w-3.5" />
				{$t('lang.switch')}
			</Button>
			<Button variant="ghost" size="icon" onclick={toggleTheme} aria-label="Toggle theme">
				{#if $theme === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</Button>
			{#if user}
				<Button variant="outline" size="sm" href="/dashboard">
					<User class="h-3.5 w-3.5" />
					{user.firstName || user.email}
				</Button>
			{:else}
				<Button variant="ghost" size="sm" href="/api/auth/login">
					{$t('nav.login')}
				</Button>
				<Button size="sm" href="/register">
					{$t('nav.getStarted')}
				</Button>
			{/if}
		</div>

		<Button variant="ghost" size="icon" class="md:hidden" onclick={() => (mobileOpen = !mobileOpen)} aria-label="Toggle menu">
			{#if mobileOpen}<X class="h-5 w-5" />{:else}<Menu class="h-5 w-5" />{/if}
		</Button>
	</nav>

	{#if mobileOpen}
		<div class="border-t border-border bg-background px-5 pb-5 md:hidden">
			{#each navLinks as link}
				<a href={link.href} class="block rounded-lg py-2.5 text-sm font-medium text-foreground" onclick={() => (mobileOpen = false)}>{$t(link.key)}</a>
			{/each}
			<hr class="my-3 border-border" />
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" onclick={switchLang}>
					<Globe class="h-3.5 w-3.5" />{$t('lang.switch')}
				</Button>
				<Button variant="ghost" size="icon" onclick={toggleTheme}>
					{#if $theme === 'dark'}<Sun class="h-4 w-4" />{:else}<Moon class="h-4 w-4" />{/if}
				</Button>
			</div>
			{#if user}
				<Button variant="outline" class="mt-3 w-full" href="/dashboard">{$t('dashboard.title')}</Button>
				<a href="/api/auth/logout" class="mt-2 block text-center text-sm text-muted-foreground">Log out</a>
			{:else}
				<Button class="mt-3 w-full" href="/register">{$t('nav.getStarted')}</Button>
			{/if}
		</div>
	{/if}
</header>
