import { en } from "./en";
import { ne } from "./ne";

const catalogs: Record<string, Record<string, string>> = { en, ne };

/**
 * Get a localized error message with parameter substitution.
 *
 * @example
 * getErrorMessage("menu.item_unavailable", "ne", { name: "Momo" })
 * // → '"Momo" हाल उपलब्ध छैन'
 */
export function getErrorMessage(
  key: string,
  locale: "en" | "ne" = "en",
  params?: Record<string, string>,
): string {
  const catalog = catalogs[locale] ?? catalogs.en;
  let message = catalog[key] ?? catalogs.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      message = message.replaceAll(`{${k}}`, v);
    }
  }
  return message;
}

/** Throw a localized error. */
export function throwLocalizedError(
  key: string,
  params?: Record<string, string>,
  locale: "en" | "ne" = "en",
): never {
  throw new Error(getErrorMessage(key, locale, params));
}
