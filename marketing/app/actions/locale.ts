"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

/** Persist the chosen locale in a cookie; the language switcher calls this then refreshes. */
export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  cookies().set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
