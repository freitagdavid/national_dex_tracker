import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';

export const pokemonApi = createApi({
    reducerPath: 'api',
    baseQuery: graphqlRequestBaseQuery({
        url: 'https://beta.pokeapi.co/graphql/v1beta/',
    }),
    endpoints: () => ({}),
    tagTypes: [],
});

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export const {} = pokemonApi;
export default pokemonApi;
