"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/data/locales";
import { getPathname } from "@/i18n/navigation";
import { encodeResult, type SharedResult } from "@/lib/engine/codec";

/**
 * Sharing happens only on press (D-018): until then no code exists anywhere.
 * The code carries rounded scores and confidences, never answers.
 */
export function ShareBox({ result }: { result: Omit<SharedResult, "engineVersionCode"> }) {
  const t = useTranslations("results");
  const locale = useLocale() as Locale;
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const create = () => {
    const code = encodeResult(result);
    const path = getPathname({ locale, href: { pathname: "/results/[code]", params: { code } } });
    setUrl(`${window.location.origin}${path}`);
  };

  return (
    <div className="max-w-2xl">
      <p className="prose-text">{t("shareLead")}</p>
      {url ? (
        <div className="mt-6">
          <label htmlFor="share-url" className="label block">
            {t("shareLink")}
          </label>
          <input
            id="share-url"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="field-input mt-2 block min-h-11 w-full border-[1.5px] border-ink bg-paper px-4 font-mono text-sm"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="primary"
              status={copied === "done" ? "success" : copied === "failed" ? "error" : undefined}
              statusLabel={copied === "done" ? t("copied") : t("copyFailed")}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied("done");
                } catch {
                  setCopied("failed");
                }
              }}
            >
              {t("copy")}
            </Button>
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <Button
                variant="secondary"
                arrow
                onClick={() => void navigator.share({ url }).catch(() => undefined)}
              >
                {t("shareNative")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <Button arrow onClick={create}>
            {t("shareCreate")}
          </Button>
        </div>
      )}
    </div>
  );
}
