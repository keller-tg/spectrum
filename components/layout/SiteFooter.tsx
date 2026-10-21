import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mark } from "./Mark";

const REPO_URL = "https://github.com/keller-tg/spectrum";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const tm = await getTranslations("meta");

  const linkClass = "link-ink text-ink-2 hover:text-ink";

  return (
    <footer className="relative z-10 mt-24 border-t border-rule-strong">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 text-ink">
            <Mark size={24} />
            <span className="display text-lg">{tm("siteName")}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">{t("disclaimer")}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{t("privacy")}</p>
        </div>

        <div>
          <h2 className="kicker">{t("explore")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/test" className={linkClass}>
                {nav("test")}
              </Link>
            </li>
            <li>
              <Link href="/compass" className={linkClass}>
                {nav("compass")}
              </Link>
            </li>
            <li>
              <Link href="/ideologies" className={linkClass}>
                {nav("ideologies")}
              </Link>
            </li>
            <li>
              <Link href="/countries" className={linkClass}>
                {nav("countries")}
              </Link>
            </li>
            <li>
              <Link href="/figures" className={linkClass}>
                {nav("figures")}
              </Link>
            </li>
            <li>
              <Link href="/parties" className={linkClass}>
                {nav("parties")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="kicker">{t("about")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/method" className={linkClass}>
                {t("method")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClass}>
                {t("privacyLink")}
              </Link>
            </li>
            <li>
              <Link href="/imprint" className={linkClass}>
                {t("imprint")}
              </Link>
            </li>
            <li>
              <Link href="/design-system" className={linkClass}>
                {t("designSystem")}
              </Link>
            </li>
            <li>
              <a href={REPO_URL} className={linkClass} rel="noreferrer">
                {t("source")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-xs text-ink-3 sm:px-6">{t("status")}</div>
    </footer>
  );
}
