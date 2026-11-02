import { HeroCrypto } from "@/components/sections/hero-crypto";
import { HeroControl } from "@/components/sections/hero-control";
import { ValueBlock } from "@/components/sections/value-block";
import { TokenPromo } from "@/components/sections/token-promo";
import { MediaMarquee } from "@/components/sections/media-marquee";
import { SecurityTrust } from "@/components/sections/security-trust";
import { PartnerStrip } from "@/components/sections/partner-strip";
import { HighPerformance } from "@/components/sections/high-performance";
import { PhoneCarousel } from "@/components/sections/phone-carousel";
import { TechnologyGrid } from "@/components/sections/technology-grid";
import { LatestNews } from "@/components/sections/latest-news";
import { LastOperations } from "@/components/sections/last-operations";
import { FinalCta } from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <>
      <HeroCrypto />
      <HeroControl />
      <ValueBlock />
      <TokenPromo />
      <MediaMarquee />
      <SecurityTrust />
      <PartnerStrip />
      <HighPerformance />
      <PhoneCarousel />
      <TechnologyGrid />
      <LatestNews />
      <LastOperations />
      <FinalCta />
    </>
  );
}
