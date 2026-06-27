import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ── Mind Ur Mind Learning Lab™ — Engineering Constitution rules ──
  {
    rules: {
      // Logging — all console calls go through src/lib/logger.ts
      "no-console": "error",

      // Always use const when variable is never reassigned
      "prefer-const": "error",

      // TypeScript — ban `any`; use `unknown` and narrow
      "@typescript-eslint/no-explicit-any": "error",

      // Explicit return types on declared functions and exported symbols.
      // allowExpressions lets inline callbacks (array.map, JSX handlers) infer freely.
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],

      // Catch unused variables; prefix with _ to intentionally ignore
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Upgrade from warn → error; all useEffect deps must be explicit
      "react-hooks/exhaustive-deps": "error",
    },
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
