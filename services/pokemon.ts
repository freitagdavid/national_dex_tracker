import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import { gql } from 'graphql-request';
import {
    transformPokemon,
    transformTypes,
    transformVersionGroups,
} from './models';
import type {
    Pokemon_V2_Generation,
    Pokemon_V2_Pokemon,
    Pokemon_V2_Type,
} from '@/api';

export interface Pokemon_V2_Pokemonsprites {
    sprites: string;
}

export interface Pokemon_V2_Typenames {
    name: string;
}

export interface Pokemon_V2_Pokemontype {
    pokemon_v2_typenames: Pokemon_V2_Typenames[];
}

export interface Pokemon_V2_Pokemontypes {
    pokemon_v2_type: Pokemon_V2_Type;
}

export interface Pokemon_V2_Pokemons {
    pokemon_v2_pokemontypes: Pokemon_V2_Pokemontypes[];
    pokemon_v2_pokemonsprites: Pokemon_V2_Pokemonsprites[];
}

export interface Pokemon_V2_Pokemondexnumbers {
    pokedex_number: number;
}

export interface GetPokemonResponse {
    pokemon_v2_pokemonspecies: {
        name: string;
        pokemon_v2_pokemondexnumbers: Pokemon_V2_Pokemondexnumbers[];
        pokemon_v2_pokemons: Pokemon_V2_Pokemons[];
    }[];
}

export interface Pokemon_V2_Versionnames {
    name: string;
}

export interface Pokemon_V2_Versiongroup {
    name: string;
    id: number;
    pokemon_v2_versionnames: Pokemon_V2_Versionnames[];
}

export interface GetVersionGroupsResponse {
    pokemon_v2_versiongroup: Pokemon_V2_Versiongroup[];
}

export interface GetTypesResponse {
    pokemon_v2_type: {
        name: string;
        id: number;
    }[];
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
                      pokemon_v2_pokemonspecies(order_by: {}) {
                        name
                        pokemon_v2_pokemondexnumbers(where: {pokedex_id: {_eq: 1}}) {
                          pokedex_number
                        }
                        pokemon_v2_pokemons {
                          pokemon_v2_pokemontypes {
                            pokemon_v2_type {
                              pokemon_v2_typenames(where: {language_id: {_eq: 9}}) {
                                name
                              }
                            }
                          }
                          pokemon_v2_pokemonsprites {
                            sprites(path: "front_default")
                          }
                        }
                      }
                    }
            `,
            }),
            transformResponse: (response: GetPokemonResponse) =>
                transformPokemon(response),
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
                return transformVersionGroups(response);
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
                return transformTypes(response);
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
