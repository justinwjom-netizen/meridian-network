"use client";

import { Check } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { PhoneFrame } from "@/components/ui/phone-frame";
import { site } from "@/data/site";

type Slide = { title: string; subtitle?: string; bullets?: string[]; phone: React.ReactNode };

const slides: Slide[] = [
  {
    title: "Sit back, relax, earn a profit",
    subtitle: "The AI handles execution while you keep full control of your risk settings.",
    phone: <PhoneFrame title="Portfolio" balance="$48,250.00" change="+12.4%" />,
  },
  {
    title: "Buy shares, earn dividends",
    subtitle: "Hold the AIAO token and participate in illustrative platform dividends.",
    phone: <PhoneFrame title="Dividends" balance="$1,920.40" change="+3.1%" />,
  },
  {
    title: "Licensed financial services",
    subtitle: "Operating within a regulated framework with segregated client accounts.",
    phone: <PhoneFrame title="Security" balance="Verified" change="Protected" />,
  },
  {
    title: `The ${site.brand} advantage:`,
    bullets: ["High consistent profits", "Game-changing AI tech", "A secure trading space"],
    phone: <PhoneFrame title="Advantage" balance="$63,110.00" change="+18.7%" />,
  },
];

export function PhoneCarousel() {
  return (
    <section className="section">
      <div className="container">
        <Carousel
          ariaLabel="Product highlights"
          slides={slides.map((s, i) => (
            <div key={i} className="grid items-center gap-10 p-2 md:grid-cols-2">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold sm:text-4xl">{s.title}</h2>
                {s.subtitle && <p className="mt-4 max-w-md text-lg text-muted">{s.subtitle}</p>}
                {s.bullets && (
                  <ul className="mt-5 space-y-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-base">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-pill bg-success/15 text-success">
                          <Check className="h-4 w-4" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="order-1 md:order-2">{s.phone}</div>
            </div>
          ))}
        />
      </div>
    </section>
  );
}
