import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        languageOptions: {
            globals: { ...globals.browser },
            parser: tsParser,
        },
        extends: fixupConfigRules(
            compat.extends(
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:react-hooks/recommended",
            ),
        ),
        plugins: {
            "react-refresh": reactRefresh,
        },
        rules: {
            "react-refresh/only-export-components": [
                "warn",
                {
                    allowConstantExport: true,
                    allowExportNames: ["buttonVariants"],
                },
            ],
        },
    },
    globalIgnores([
        "dist/**",
        "src/gql/graphql.ts",
        "src/gql/fragment-masking.ts",
        "tailwind.config.js",
    ]),
]);
