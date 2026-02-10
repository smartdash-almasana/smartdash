import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  basePath: __dirname,
});

const eslintConfig = [
  // Extiende las reglas recomendadas de Next.js y TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Configuraciones sugeridas para el desarrollo inicial
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;