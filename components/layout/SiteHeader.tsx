import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Wordmark } from "./Mark";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { ThemeToggle } from "./ThemeToggle";

const NAV = ["test", "compass", "ideologies", "dashboard"] as const;
const HREF = {
  test: "/test",
  compass: "/compass",
  ideologies: "/ideologies",
  dashboard: "/dashboard",
} as const;

const cell =
  "bracketed label flex min-h-14 items-center px-4 no-underline hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper";

/** One ruled row of cells: wordmark, sections, language, theme. */
export async function SiteHeader() {
  const t = await getTranslations("nav");
  const tm = await getTranslations("meta");

  return (
    <header className="relative z-20 border-b-2 border-ink" data-print="hide">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <Link
          href="/"
          aria-label={t("home")}
          className="flex min-h-14 items-center border-r-2 border-ink px-4 no-underline hover:bg-ink hover:text-paper"
        >
          <Wordmark name={tm("siteName")} />
        </Link>

        <nav aria-label={t("primary")} className="hidden lg:flex">
          <ul className="flex">
            {NAV.map((key) => (
              <li key={key} className="flex border-r-2 border-ink">
                <NavLink href={HREF[key]} className={cell}>
                  {t(key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-stretch">
          <div className="flex border-l-2 border-ink">
            <LocaleSwitcher />
          </div>
          <div className="hidden border-l-2 border-ink px-3 md:flex">
            <ThemeToggle />
          </div>
          <MobileMenu label={t("menu")} className="lg:hidden">
            <nav aria-label={t("primary")}>
              <ul>
                {NAV.map((key) => (
                  <li key={key} className="flex border-b-2 border-ink last:border-b-0">
                    <NavLink href={HREF[key]} className={`${cell} w-full`}>
                      {t(key)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex border-t-2 border-ink px-3 md:hidden">
              <ThemeToggle />
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
