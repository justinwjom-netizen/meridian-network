export const locales = ["en", "de", "es", "it", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  fr: "Français",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";
