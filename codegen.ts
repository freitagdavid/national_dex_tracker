import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "https://beta.pokeapi.co/graphql/v1beta2",
    documents: ["src/**/*.{ts,tsx,gql}"],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        "./src/gql/": {
            preset: "client",
            plugins: [],
        },
    },
};

export default config;
