// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default defineConfig([
  globalIgnores(["**/*.js"]),
  {files: ["**/*.ts"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]);
