import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeaderScroll } from "./HeaderScroll";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Wordmark } from "./Mark";
import { MobileNav } from "./MobileNav";
import { NavIndicator } from "./NavIndicator";
import { NavLink } from "./NavLink";
import { ThemeSwitch } from "./ThemeSwitch";

const NAV = [
  ["test", "/test"],
  ["compass", "/compass"],
  ["ideologies", "/ideologies"],
  ["dashboard", "/dashboard"],
] as const;

/**
 * Sticky header: solid paper, a 1px rule, and an 8px ordered-dither band that
 * appears once the page scrolls (instead of a shadow or blur).
 */
export async function SiteHeader() {
  const t = await getTranslations("nav");
  const tm = await getTranslations("meta");

  return (
    <header className="site-header" data-print="hide">
      <div className="mx-auto flex h-14 max-w-[96rem] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={t("home")} className="flex min-h-11 items-center no-underline">
          <Wordmark name={tm("siteName")} />
        </Link>

        <nav aria-label={t("primary")} className="nav relative ml-4 hidden h-full lg:flex">
          <ul className="flex h-full">
            {NAV.map(([key, href]) => (
              <li key={key} className="flex">
                <NavLink href={href} className="nav-link label flex items-center px-4">
                  {t(key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavIndicator />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeSwitch className="hidden md:inline-grid" />
          <MobileNav
            className="lg:hidden"
            labels={{ menu: t("menu"), close: t("close"), primary: t("primary") }}
            items={NAV.map(([key, href]) => ({ href, label: t(key) }))}
          >
            <ThemeSwitch />
          </MobileNav>
        </div>
      </div>
      <span className="site-header-band dither-fade" aria-hidden="true" />
      <HeaderScroll />
    </header>
  );
}
