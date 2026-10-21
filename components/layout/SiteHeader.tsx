import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Mark } from "./Mark";
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

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const tm = await getTranslations("meta");

  const links = (itemClass: string) =>
    NAV.map((key) => (
      <li key={key}>
        <NavLink href={HREF[key]} className={itemClass}>
          {t(key)}
        </NavLink>
      </li>
    ));

  return (
    <header className="relative z-20 border-b border-rule bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label={t("home")} className="group flex items-center gap-2.5 text-ink">
          <span className="transition-transform duration-500 ease-out group-hover:rotate-[30deg]">
            <Mark />
          </span>
          <span className="display text-[1.35rem] leading-none tracking-tight">
            {tm("siteName")}
          </span>
        </Link>

        <nav aria-label={t("primary")} className="ml-8 hidden md:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {links(
              "relative py-1 text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:-bottom-[13px] aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-accent",
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileMenu label={t("menu")}>
            <nav aria-label={t("primary")}>
              <ul className="flex flex-col text-sm font-medium">
                {links(
                  "block rounded-md px-3 py-2.5 text-ink-2 hover:bg-paper-sunk hover:text-ink aria-[current=page]:text-ink aria-[current=page]:font-semibold",
                )}
              </ul>
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
