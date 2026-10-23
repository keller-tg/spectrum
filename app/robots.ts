import type { MetadataRoute } from "next";
import { LAUNCHED } from "@/lib/seo/launch";
import { SITE_URL } from "@/lib/seo/site";

/** Before launch everything is disallowed and no sitemap is advertised (D-088). */
export default function robots(): MetadataRoute.Robots {
  if (!LAUNCHED) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
