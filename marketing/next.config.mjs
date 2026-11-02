import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Placeholder images live in /public; add remote patterns here if you swap in a CDN.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [];
  },
};

export default withNextIntl(nextConfig);
