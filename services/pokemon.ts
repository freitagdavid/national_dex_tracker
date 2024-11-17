import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import type {
    Pokemon_V2_Type,
    Pokemon_V2_Generation,
    Pokemon_V2_Pokemon,
} from 'api';
import { gql } from 'graphql-request';
import { transformTypes, transformVersionGroups } from './models';

export interface GetPokemonResponse {
    pokemon_v2_pokemon: Pokemon_V2_Pokemon[];
}

export interface GetVersionGroupsResponse {
    pokemon_v2_versiongroup: {
        name: string;
        id: number;
        pokemon_v2_versionnames: {
            name: string;
        }[];
    }[];
}

export interface GetTypesResponse {
    pokemon_v2_type: Pokemon_V2_Type[];
}

export const pokemonApi = createApi({
    reducerPath: 'api',
    baseQuery: graphqlRequestBaseQuery({
        url: 'https://beta.pokeapi.co/graphql/v1beta/',
    }),
    endpoints: (builder) => ({
        getAllPokemon: builder.query<GetPokemonResponse, void>({
            query: () => ({
                document: gql`
                query getAllPokemon {
                        pokemon_v2_pokemon {
                            name
                        }
                    }
            `,
            }),
        }),
        getVersionGroups: builder.query<GetVersionGroupsResponse, void>({
            query: () => ({
                document: gql`
                    query getVersionGroups {
                      pokemon_v2_versiongroup(order_by: {order: asc}) {
                        name
                        pokemon_v2_versions {
                          pokemon_v2_versionnames(where: {language_id: {_eq: 9}}) {
                            name
                          }
                        }
                        id
                      }
                    }
`,
            }),
            transformResponse: (response: GetVersionGroupsResponse) => {
                return transformVersionGroups(response.pokemon_v2_versiongroup);
            },
        }),
        getGenerations: builder.query<Pokemon_V2_Generation[], void>({
            query: () => ({
                document: gql`
                query getGenerations {
                    pokemon_v2_generation {
                        name
                        id
                      }
                }
                `,
            }),
        }),
        getTypes: builder.query<GetTypesResponse, void>({
            query: () => ({
                document: gql`
                query getTypes {
                    pokemon_v2_type {
                        name
                        id
                      }
                }
                `,
            }),
            transformResponse: (response: GetTypesResponse) => {
                return transformTypes(response.pokemon_v2_type);
            },
        }),
    }),
    tagTypes: [],
});
export const {
    useGetAllPokemonQuery,
    useGetVersionGroupsQuery,
    useGetGenerationsQuery,
    useGetTypesQuery,
} = pokemonApi;
export default pokemonApi;
