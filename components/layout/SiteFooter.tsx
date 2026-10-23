import { getTranslations } from "next-intl/server";
import { ExternalLink, TextLink } from "@/components/ui/TextLink";

const REPO_URL = "https://github.com/keller-tg/spectrum";

const EXPLORE = [
  ["test", "/test"],
  ["compass", "/compass"],
  ["ideologies", "/ideologies"],
  ["countries", "/countries"],
  ["figures", "/figures"],
  ["parties", "/parties"],
] as const;

const ABOUT = [
  ["method", "/method"],
  ["privacyLink", "/privacy"],
  ["imprint", "/imprint"],
] as const;

/** Three ruled columns, then the wordmark across the full width, cropped at the bottom. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const tm = await getTranslations("meta");

  return (
    <footer className="mt-auto border-t-2 border-ink">
      <div className="mx-auto grid max-w-[96rem] grid-cols-12 px-4 sm:px-6 lg:px-10">
        <div className="col-span-12 border-b border-ink py-8 md:col-span-6 md:border-r md:border-b-0 md:pr-8">
          <p className="prose-text">{t("disclaimer")}</p>
          <p className="prose-text mt-2">{t("privacy")}</p>
        </div>
        <nav
          aria-labelledby="footer-explore"
          className="col-span-6 border-r border-ink py-8 pr-4 md:col-span-3 md:px-8"
          data-print="hide"
        >
          <h2 id="footer-explore" className="annot">
            {t("explore")}
          </h2>
          <ul className="mt-3 space-y-1">
            {EXPLORE.map(([key, href]) => (
              <li key={key}>
                <TextLink href={href} className="inline-flex min-h-11 items-center">
                  {nav(key)}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>
        <nav
          aria-labelledby="footer-about"
          className="col-span-6 py-8 pl-4 md:col-span-3 md:px-8"
          data-print="hide"
        >
          <h2 id="footer-about" className="annot">
            {t("about")}
          </h2>
          <ul className="mt-3 space-y-1">
            {ABOUT.map(([key, href]) => (
              <li key={key}>
                <TextLink href={href} className="inline-flex min-h-11 items-center">
                  {t(key)}
                </TextLink>
              </li>
            ))}
            <li>
              <ExternalLink href={REPO_URL} className="inline-flex min-h-11 items-center">
                {t("source")}
              </ExternalLink>
            </li>
          </ul>
        </nav>
      </div>
      <p className="annot mx-auto max-w-[96rem] border-t border-ink px-4 py-3 sm:px-6 lg:px-10">
        {t("status")}
      </p>
      <div aria-hidden="true" className="h-[11.5vw] overflow-hidden select-none">
        <p className="px-[1.5vw] font-mono text-[18vw] leading-none font-bold tracking-[-0.03em] whitespace-nowrap">
          {tm("siteName").toUpperCase()}
        </p>
      </div>
    </footer>
  );
}
