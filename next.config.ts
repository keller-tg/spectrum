import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { LAUNCHED, NOINDEX_HEADER } from "./lib/seo/launch";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Cache Components stays off: next-intl documents static rendering via
// generateStaticParams + next/root-params, not under cacheComponents (D-057).
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The pilot is unlinked and must never be indexed (PLAN §7a); a robots.txt
  // Disallow line would only advertise it.
  // Before launch, nothing at all is indexed (D-088).
  async headers() {
    return [
      ...(LAUNCHED ? [] : [{ source: "/:path*", headers: [NOINDEX_HEADER] }]),
      { source: "/:locale(en|de|fr)/pilot", headers: [NOINDEX_HEADER] },
    ];
  },
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
