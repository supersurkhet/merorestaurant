import { create } from 'zustand';
import { en, type TranslationKeys } from './en';
import { ne } from './ne';

export type Locale = 'en' | 'ne';

const translations: Record<Locale, TranslationKeys> = { en, ne };

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

export const useI18n = create<I18nStore>((set) => ({
  locale: 'en',
  t: en,
  setLocale: (locale) => set({ locale, t: translations[locale] }),
}));

export const LOCALE_NAMES: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  ne: { name: 'Nepali', nativeName: 'नेपाली' },
};
