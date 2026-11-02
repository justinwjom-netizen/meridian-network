import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

import { site } from "@/data/site";
import { locales } from "@/i18n/config";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { MobileCtaBar } from "@/components/mobile-cta-bar";
import { ToastProvider } from "@/components/ui/toast";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const display = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: `${site.brand} — AI-Powered Trading Platform`,
    template: `%s · ${site.brand}`,
  },
  description: site.description,
  applicationName: site.brand,
  keywords: ["AI trading", "crypto", "forex", "stocks", "fintech", site.brand, site.token],
  openGraph: {
    type: "website",
    siteName: site.brand,
    title: `${site.brand} — AI-Powered Trading Platform`,
    description: site.description,
    url: site.domain,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: site.brand }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.brand} — AI-Powered Trading Platform`,
    description: site.description,
    images: ["/og.svg"],
  },
  alternates: {
    canonical: "/",
    languages: Object.fromEntries(locales.map((l) => [l, `/?lang=${l}`])),
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.brand,
  url: site.domain,
  description: site.description,
  sameAs: Object.values(site.social),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <ToastProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
              >
                Skip to content
              </a>
              <Navbar />
              <main id="main">{children}</main>
              <Footer />
              <MobileCtaBar />
              <CookieConsent />
            </ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
