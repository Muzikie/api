import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

const config = [
  {
    files: ["./src/**/*.ts", "./config/**/*.ts"],
    ignores: [
      "node_modules",
      "public",
      "src/admin/**",
      "dist/**",
      ".strapi/**",
      ".husky/**",
      ".github/**",
      ".yarn/**",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs["eslint-recommended"].rules,
      ...tseslint.configs.recommended.rules,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
  },
];

export default config;
