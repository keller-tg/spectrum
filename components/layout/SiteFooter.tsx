import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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

const link = "link inline-flex min-h-11 items-center";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="mt-auto border-t-2 border-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-12">
        <div className="col-span-12 border-b-2 border-ink p-4 md:col-span-6 md:border-r-2 md:border-b-0">
          <p className="prose-text">{t("disclaimer")}</p>
          <p className="prose-text mt-2">{t("privacy")}</p>
        </div>
        <nav
          aria-labelledby="footer-explore"
          className="col-span-6 border-r-2 border-ink p-4 md:col-span-3"
          data-print="hide"
        >
          <h2 id="footer-explore" className="label">
            {t("explore")}
          </h2>
          <ul className="mt-1 flex flex-wrap gap-x-4">
            {EXPLORE.map(([key, href]) => (
              <li key={key}>
                <Link href={href} className={link}>
                  {nav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav
          aria-labelledby="footer-about"
          className="col-span-6 p-4 md:col-span-3"
          data-print="hide"
        >
          <h2 id="footer-about" className="label">
            {t("about")}
          </h2>
          <ul className="mt-1 flex flex-wrap gap-x-4">
            {ABOUT.map(([key, href]) => (
              <li key={key}>
                <Link href={href} className={link}>
                  {t(key)}
                </Link>
              </li>
            ))}
            <li>
              <a href={REPO_URL} className={link} rel="noreferrer">
                {t("source")}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="label border-t-2 border-ink">
        <span className="mx-auto block max-w-7xl px-4 py-3">{t("status")}</span>
      </p>
    </footer>
  );
}
