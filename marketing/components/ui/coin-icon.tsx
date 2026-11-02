import { cn } from "@/lib/utils";

export type CoinSymbol = "BTC" | "ETH" | "LTC" | "SOL" | "XMR";

const GRADS: Record<CoinSymbol, [string, string]> = {
  BTC: ["#F7931A", "#FFB955"],
  ETH: ["#627EEA", "#8FA4F3"],
  LTC: ["#345D9D", "#5B86C9"],
  SOL: ["#9945FF", "#14F195"],
  XMR: ["#FF6600", "#FF9147"],
};

const GLYPH: Record<CoinSymbol, string> = {
  BTC: "₿",
  ETH: "Ξ",
  LTC: "Ł",
  SOL: "◎",
  XMR: "ɱ",
};

/** Self-contained SVG coin chip (no external image). */
export function CoinIcon({
  symbol,
  size = 56,
  className,
}: {
  symbol: CoinSymbol;
  size?: number;
  className?: string;
}) {
  const [a, b] = GRADS[symbol];
  const id = `coin-${symbol}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]", className)}
      role="img"
      aria-label={`${symbol} coin`}
    >
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={b} />
          <stop offset="100%" stopColor={a} />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id})`} />
      <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="30"
        fontWeight="700"
        fill="white"
        fontFamily="var(--font-display), sans-serif"
      >
        {GLYPH[symbol]}
      </text>
    </svg>
  );
}
