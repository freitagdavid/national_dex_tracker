import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type { Pokemon } from './types';
import type { RootState } from '../../app/store';

const NUM_SECONDS_IN_A_WEEK = 604800

interface PokemonSpeciesCollection {
    count: number,
    next: URL,
    results: [
        {
            name: string,
            url: URL,
        }
    ]
}

export const pokeApi = createApi({
    reducerPath: 'pokeApi',
    keepUnusedDataFor: NUM_SECONDS_IN_A_WEEK,
    baseQuery: fetchBaseQuery({baseUrl: 'https://pokeapi.co/api/v2/'}),
    endpoints: (builder) => ({
        getPokemonByName: builder.query<Pokemon, string>({
          query: (name) => `pokemon/${name}`,
        }),
        getNumPokemonSpecies: builder.query<number, void>({
            query: () => `pokemon-species`,
            transformResponse: (res: PokemonSpeciesCollection) => res.count
        }),
        getPokemonChunk: builder.query<Pokemon, number>({
            query: (offset=0, limit=20) => `pokemon?offset=${offset}&limit=${limit}`
        }),
        getPokemonSpeciesAll: builder.query<PokemonSpeciesCollection, (number | void)>({
            query: (count=1025) => `pokemon-species?limit=${count}`
        })
      }),
})




export const {getPokemonSpeciesAll} = pokeApi.endpoints;

export const selectGetPokemonSpeciesAllQuery = (state: RootState) => pokeApi.endpoints.getPokemonSpeciesAll.select(1025)(state).data
export const {useGetPokemonByNameQuery, useGetPokemonChunkQuery, useGetPokemonSpeciesAllQuery, useGetNumPokemonSpeciesQuery} = pokeApi;