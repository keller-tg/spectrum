/**
 * The whole palette (D-075): two colours that swap between modes. app/globals.css
 * declares the same values as --ink and --paper. scripts/check-palette.ts allows
 * colour literals only here, in those CSS declarations and in app/icon.svg.
 */
export const PALETTE = {
  light: { ink: "#000", paper: "#fff" },
  dark: { ink: "#fff", paper: "#000" },
} as const;

export type ThemeName = keyof typeof PALETTE;
