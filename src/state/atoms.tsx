import { atomWithQuery } from 'jotai-urql';
import type { Pokemon_V2_Pokemonspecies } from '@/gql/graphql';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';

export const caughtStatusFamily = atomFamily((id: number) => atomWithStorage<boolean>(`caught-${id}`, false));
export const caughtNumber = atomWithStorage('caughtNumber', 0)

export const caughtStatus = atomFamily((id: number) => atom(
  (get): boolean => get(caughtStatusFamily(id)),
  (get, set, caught: boolean) => {
    set(caughtStatusFamily(id), caught);

    if (caught) {
      set(caughtNumber, (n) => n + 1)
    } else {
      set(caughtNumber, (n) => n - 1)
    }
  }
))

export const pokemonListQuery = atomWithQuery<Pokemon_V2_Pokemonspecies>({
  query: `
    query {
      pokemon_v2_pokemonspecies(order_by: {id: asc}) {
        name
        id
        pokemon_v2_pokemons {
          pokemon_v2_pokemonsprites {
            sprites(path: "other.official-artwork")
          }
        }
      }
    }
      
    `
})