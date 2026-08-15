import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // three.js is ~150KB and must stay in the lazily-imported scene chunk.
    // Nothing else stops someone importing it from a server component and
    // silently putting it on the critical path, so this rule does.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "three",
              message:
                "Import three only in app/components/TowerScene.tsx — anywhere else puts it on the critical path.",
            },
          ],
          patterns: ["three/*"],
        },
      ],
    },
  },
  {
    files: ["app/components/TowerScene.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
]);

export default eslintConfig;
