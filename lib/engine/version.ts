/**
 * Scoring-model version. Bump it whenever engine output can change for the
 * same answers; stored results then show "as taken" vs "recomputed" (PLAN §6.8).
 * The golden-fixture test fails if outputs change without a bump.
 */
export const ENGINE_VERSION = "1.0.0";

/** Compact form for share codes: major·256 + minor (patch is not encoded). */
export function engineVersionCode(version: string = ENGINE_VERSION): number {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  return ((major & 0xff) << 8) | (minor & 0xff);
}
