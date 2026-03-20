import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (browser) {
		const stored = localStorage.getItem('theme');
		if (stored === 'light' || stored === 'dark') return stored;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
}

export const theme = writable<Theme>(getInitialTheme());

export function toggleTheme() {
	theme.update((t) => {
		const next = t === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('theme', next);
			document.documentElement.classList.toggle('dark', next === 'dark');
		}
		return next;
	});
}

export function initTheme() {
	if (browser) {
		const t = getInitialTheme();
		document.documentElement.classList.toggle('dark', t === 'dark');
		theme.set(t);
	}
}
