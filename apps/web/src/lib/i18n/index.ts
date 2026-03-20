import { writable, derived } from 'svelte/store';
import en from './en.json';
import ne from './ne.json';

export type Locale = 'en' | 'ne';

const translations: Record<Locale, Record<string, string>> = { en, ne };

export const locale = writable<Locale>('en');

export const t = derived(locale, ($locale) => {
	return (key: string): string => {
		return translations[$locale]?.[key] ?? translations.en[key] ?? key;
	};
});

export function setLocale(l: Locale) {
	locale.set(l);
	if (typeof document !== 'undefined') {
		document.documentElement.lang = l;
	}
}
