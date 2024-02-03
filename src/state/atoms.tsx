import { atomWithQuery } from 'jotai-urql';
import type { Pokemon_V2_Pokemonspecies } from '@/gql/graphql';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';

export const caughtStatusFamily = atomFamily((id: number) => atomWithStorage<boolean>(`caught-${id}`, false));
export const caughtNumber = atomWithStorage('caughtNumber', 0)

export const numPokemonAtom = atom(
  (get) => get(pokemonListQuery).data?.pokemon_v2_pokemonspecies.length || 0
)

export const numBoxesAtom = atom(
  (get) => Math.ceil(get(numPokemonAtom) / 30)
)

export const boxesAtom = atom(
  (get): [Pokemon_V2_Pokemonspecies[]] => {
    const boxes: [Pokemon_V2_Pokemonspecies[]] = [] as unknown as [Pokemon_V2_Pokemonspecies[]];
    const pokemonList = get(pokemonListQuery).data?.pokemon_v2_pokemonspecies || [];
    for (let i = 0; i < get(numBoxesAtom); i++) {
      boxes.push(pokemonList.slice(i * 30, i * 30 + 30))
    }
    return boxes;
  }
)


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