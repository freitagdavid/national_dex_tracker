import { type CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "http://localhost:8080/v1/graphql",
    documents: ["src/**/*.graphql"],
    overwrite: true,
    generates: {
        "src/app/services/types.generated.ts": {
            plugins: ["typescript"],
            config: {
                maybeValue: "T",
                extractAllFieldsToTypes: true,
            },
        },
        "src/": {
            preset: "near-operation-file",
            presetConfig: {
                baseTypesPath: "@App/services/types.generated.ts",
            },
            plugins: ["typescript-operations", "typescript-rtk-query"],
            config: {
                importBaseApiFrom: "@App/services/baseApi",
                exportHooks: true,
                maybeValue: "T",
            },
        },
    },
    hooks: { afterAllFileWrite: ["prettier --write"] },
};

export default config;
