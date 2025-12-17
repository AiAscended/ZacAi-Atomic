import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".cache/**",
      "build/**",
      "dist/**",
      "out/**",
      "scripts/**/*.cjs",
      "scripts/**/*.js",
      "src/lib/**/*.cjs",
      "src/ai/knowledge-domains/**",
      "src/ai/inference/**",
      "src/ai/models/**",
      "next-env.d.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**"
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/alt-text": "off",
    },
  },
];

export default eslintConfig;
