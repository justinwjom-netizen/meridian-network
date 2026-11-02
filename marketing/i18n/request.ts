import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value as Locale | undefined;
  const locale: Locale =
    cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale;

  // EN is the complete catalogue; other locales are stubbed and fall back to EN
  // for any missing keys (configured via getMessageFallback below).
  const messages = (await import(`../messages/${locale}.json`)).default;
  const fallback = (await import(`../messages/en.json`)).default;

  return {
    locale,
    messages: { ...fallback, ...messages },
    getMessageFallback({ key }: { key: string }) {
      return key;
    },
  };
});
