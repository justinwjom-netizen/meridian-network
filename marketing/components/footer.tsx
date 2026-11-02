import Link from "next/link";
import { Instagram, Youtube, Facebook, Twitter, Send } from "lucide-react";
import { site } from "@/data/site";
import { footerNav } from "@/data/nav";
import { Logo } from "./logo";

const socials = [
  { label: "Instagram", href: site.social.instagram, Icon: Instagram },
  { label: "YouTube", href: site.social.youtube, Icon: Youtube },
  { label: "Facebook", href: site.social.facebook, Icon: Facebook },
  { label: "X", href: site.social.x, Icon: Twitter },
  { label: "Telegram", href: site.social.telegram, Icon: Send },
];

const payments = ["Visa", "Mastercard", "Maestro", "SEPA", "USDT", "BTC"];

export function Footer() {
  const columns = [footerNav.product, footerNav.company, footerNav.legal];

  return (
    <footer className="relative mt-10 border-t border-border bg-surface/40">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand block */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">{site.description}</p>

            <div className="mt-5 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-border/60 text-muted transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <StoreBadge href={site.apps.googlePlay} top="GET IT ON" bottom="Google Play" />
              <StoreBadge href={site.apps.appStore} top="Download on the" bottom="App Store" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {payments.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-border/60 bg-surface px-2.5 py-1 text-[11px] font-medium text-muted"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-text">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Disclosures */}
        <div className="mt-12 space-y-4 border-t border-border pt-8">
          <p className="text-xs leading-relaxed text-muted">
            {site.operatorDisclosure.replace("{BRAND}", site.brand)}
          </p>
          <div
            role="note"
            className="rounded-md border border-danger/30 bg-danger/10 p-4 text-xs leading-relaxed text-danger"
          >
            <strong className="font-semibold">Risk warning: </strong>
            {site.riskWarning}
          </div>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {site.brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function StoreBadge({ href, top, bottom }: { href: string; top: string; bottom: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-surface px-3 py-2 transition-colors hover:border-primary/50"
    >
      <span className="inline-block h-6 w-6 rounded bg-primary-gradient" aria-hidden="true" />
      <span className="leading-tight">
        <span className="block text-[9px] uppercase tracking-wide text-muted">{top}</span>
        <span className="block text-xs font-semibold text-text">{bottom}</span>
      </span>
    </Link>
  );
}
