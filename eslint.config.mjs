import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import i18next from "eslint-plugin-i18next";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "generated/**",
    "test-results/**",
    "playwright-report/**",
  ]),

  // No hardcoded user-facing strings in UI code: every visible text and
  // accessible label comes from messages/*.json or localized data.
  {
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    plugins: { i18next },
    rules: {
      // Visible JSX text must come from translations.
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-text-only",
          words: { exclude: ["^[\\s\\d.,:;·•–—/|×+−%()#§*\\[\\]\\-]+$"] },
        },
      ],
      // Accessible names are user-facing text too.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name=/^(aria-label|aria-description|alt|title|placeholder)$/] > Literal[value=/[A-Za-zÀ-ÿ]/]",
          message: "Accessible names must come from messages/*.json, not string literals.",
        },
      ],
    },
  },

  // The scoring engine is pure: no UI, framework, browser or I/O imports.
  {
    files: ["lib/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-*", "next", "next/*", "next-intl", "next-intl/*"],
              message: "lib/engine must stay framework-free.",
            },
            {
              group: [
                "@/app/*",
                "@/components/*",
                "@/lib/storage/*",
                "@/lib/sync/*",
                "@/lib/server/*",
                "@/i18n/*",
              ],
              message: "lib/engine may only import from lib/engine and data types.",
            },
            { group: ["fs", "node:*", "path"], message: "lib/engine must not do I/O." },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "localStorage",
        "indexedDB",
        "fetch",
        "navigator",
      ],
    },
  },
]);

export default eslintConfig;
