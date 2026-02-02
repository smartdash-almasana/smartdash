import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off", // Útil para la fase de desarrollo
      "react/react-in-jsx-scope": "off", // React 19 no lo necesita
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    // Ignorar carpetas de build para que no den errores falsos
    ignores: [".next/*", "node_modules/*", "dist/*"],
  }
];