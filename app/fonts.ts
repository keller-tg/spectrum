import localFont from "next/font/local";

/**
 * Two self-hosted families (D-076), no font requests to any other host:
 * Archivo (variable weight; heavy for display, regular for prose) and
 * IBM Plex Mono (UI, labels, numbers). Both SIL OFL 1.1, licences in ./fonts.
 *
 * Each family is split into latin (preloaded, covers en/de/fr) and latin-ext
 * (loaded only when a page needs a character such as ğ or ł). next/font needs
 * literal options, so the two unicode ranges are repeated in each call.
 */

const grotesk = localFont({
  src: "./fonts/archivo-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-grotesk",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});

const groteskExt = localFont({
  src: "./fonts/archivo-latin-ext-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-grotesk-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    },
  ],
});

const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono-latin",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});

const monoExt = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-ext-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-ext-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    },
  ],
});

/** Class names that define the four font variables; set on <html>. */
export const fontVariables = [grotesk, groteskExt, mono, monoExt].map((f) => f.variable).join(" ");
