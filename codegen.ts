import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'https://beta.pokeapi.co/graphql/v1beta',
    documents: './**/*.gql',
    // ignoreNoDocuments: true,
    overwrite: true,
    generates: {
        // 'services/types.generated.ts': {
        //     plugins: ['typescript'],
        //     config: {
        //         maybeValue: 'T | null',
        //     },
        // },
        // './api.ts': {
        //     plugins: [
        //         'typescript',
        //         'typescript-resolvers',
        //         {
        //             'typescript-rtk-query': {
        //                 importBaseApiFrom: './services/pokemon.ts',
        //                 importBaseApiAlternateName: 'pokemonApi',
        //                 exportHooks: true,
        //                 overrideExisting: true,
        //             },
        //         },
        //     ],
        // },
        // './schema.graphql': {
        //     plugins: ['schema-ast'],
        //     config: {
        //         includeDirectives: true,
        //     },
        // },


        // "types/generated.d.ts": {
        //     plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
        // },
        // "types/generated-introspection.json": {
        //     plugins: ['introspection'],
        // },
        "graphql/__generated__/graphql.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-query",
            ],
            config: {
                reactQueryVersion: "auto",
                exposeQueryKeys: true,
                exposeFetcher: true,
            },
        },
    },
};

export default config;
