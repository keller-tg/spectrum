"use client";

import { useLayoutEffect } from "react";
import { applyPreferences, PREFERENCES } from "@/lib/design/preferences";

/**
 * Re-applies the stored display preferences whenever the root layout mounts.
 * A language switch remounts the [locale] root layout and React clears the
 * <html> attributes it does not own; this runs in the same commit, before
 * paint, so nothing flickers and no reload is needed (D-082).
 */
export function PreferenceSync() {
  useLayoutEffect(() => {
    applyPreferences(PREFERENCES);
  }, []);
  return null;
}
