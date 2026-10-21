import { getTranslations } from "next-intl/server";
import type { Locale } from "@/data/locales";
import { MODE_IDS, MODES } from "@/data/modes";
import { Link } from "@/i18n/navigation";
import { modeSlug } from "@/i18n/params";

/** Deep opens once its question bank exists (Phase 9). */
const OPEN = { quick: true, standard: true, deep: false } as const;

export async function ModeCards({ locale }: { locale: Locale }) {
  const t = await getTranslations("home");

  return (
    <div>
      <h2 className="kicker">{t("chooseMode")}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {MODE_IDS.map((id) => {
          const mode = MODES[id];
          const recommended = id === "standard";
          const body = (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="display text-3xl text-ink">{t(`modes.${id}.name`)}</span>
                {recommended ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-accent-ink uppercase">
                    {t("recommended")}
                  </span>
                ) : null}
              </div>
              <p className="tabular mt-3 text-sm font-semibold text-ink">
                {t("modeCount", { count: mode.count })}
                <span aria-hidden="true" className="mx-2 text-ink-3">
                  ·
                </span>
                <span className="font-normal text-ink-2">
                  {t("modeTime", { minutes: mode.minutes })}
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{t(`modes.${id}.blurb`)}</p>
              <span
                className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${OPEN[id] ? "text-accent" : "text-ink-3"}`}
              >
                {OPEN[id] ? t("start") : t("opensSoon")}
                {OPEN[id] ? (
                  <svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
                  </svg>
                ) : null}
              </span>
            </>
          );
          const frame = `group flex h-full flex-col rounded-xl border p-5 transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out ${
            recommended ? "border-ink bg-paper-raised" : "border-rule-strong bg-paper-raised/60"
          }`;
          return (
            <li key={id}>
              {OPEN[id] ? (
                <Link
                  href={{
                    pathname: "/test/[mode]/[n]",
                    params: { mode: modeSlug(locale, id), n: "1" },
                  }}
                  className={`${frame} hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_22px_40px_-28px_rgb(0_0_0/0.45)]`}
                >
                  {body}
                </Link>
              ) : (
                <div className={`${frame} border-dashed bg-transparent`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 max-w-2xl text-sm text-ink-2">{t("modesNote")}</p>
    </div>
  );
}
