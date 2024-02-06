import { atomWithQuery } from 'jotai-urql';
import type { AllPokemonSpeciesWithSpritesQuery, AllVersionsEnglishNamesQuery, Pokemon_V2_Pokemondexnumber, Pokemon_V2_Pokemonspecies, Pokemon_V2_Pokemontype } from '@/gql/graphql';
import { atomFamily, atomWithStorage, splitAtom } from 'jotai/utils';
import { Atom, atom } from 'jotai';
import { gql } from 'urql';

export const caughtStatusFamily = atomFamily((id: number) => atomWithStorage<boolean>(`caught-${id}`, false));
export const caughtNumber = atomWithStorage('caughtNumber', 0)

export const numPokemonAtom = atom(
  (get) => get(pokemonAtomsAtom).length || 0
)

export const listTypeAtom = atomWithStorage<'grid' | 'list' | 'box'>('listLayout', 'box')

export const numBoxesAtom = atom(
  (get) => Math.ceil(get(numPokemonAtom) / 30)
)

export const selectedRegionAtom = atomWithStorage('selectedRegion', 'national');

export const selectedGameAtom = atomWithStorage('selectedGame', 0);

export const boxCaughtAtom = atomFamily((box: number) => atomWithStorage(`box-${box}-caught`, 0))

export const boxesAtom = atom(
  (get): [Atom<Pokemon>[]] => {
    const boxes: [Atom<Pokemon>[]] = [] as unknown as [Atom<Pokemon>[]];
    const pokemonList = get(pokemonAtomsAtom) || [];
    for (let i = 0; i < get(numBoxesAtom); i++) {
      boxes.push(pokemonList.slice(i * 30, i * 30 + 30))
    }
    return boxes;
  }
)

export const processedPokemonList = atom((get) => {
  const pokemonList = get(rawToProcessedAtom) || [];
  return pokemonList.map((poke: Pokemon): Pokemon => {
    return {
      ...poke,
    }
  })
})

export const pokemonAtomsAtom = splitAtom<Pokemon, Pokemon>(processedPokemonList);

export const caughtStatus = atomFamily((id: number) => atom(
  (get): boolean => get(caughtStatusFamily(id)),
  (get, set, { caught, boxNum }: { caught: boolean; boxNum?: number; }) => {
    set(caughtStatusFamily(id), caught);

    if (caught) {
      set(caughtNumber, (n) => n + 1)
      boxNum && set(boxCaughtAtom(boxNum), (n) => n + 1)
    } else {
      set(caughtNumber, (n) => n - 1)
      boxNum && set(boxCaughtAtom(boxNum), (n) => n - 1)
    }
  }
))

export interface Pokemon {
  caught: Atom<boolean>;
  name: string;
  id: number;
  sprites: {
    front_default: string;
    front_shiny: string;
  };
  types: (string | undefined)[];
  regions: (string | undefined)[];
}

export const rawToProcessedAtom = atom((get) => {
  const res = get(rawPokemonList);
  if (res.data) {
    const pokemonList = res.data.pokemon_v2_pokemonspecies;
    return pokemonList.map((poke: Pokemon_V2_Pokemonspecies): Pokemon => {
      return {
        ...poke,
        caught: caughtStatus(poke.id),
        sprites: {
          front_default: poke.pokemon_v2_pokemons[0].pokemon_v2_pokemonsprites[0].sprites.front_default,
          front_shiny: poke.pokemon_v2_pokemons[0].pokemon_v2_pokemonsprites[0].sprites.front_shiny
        },
        types: [...poke.pokemon_v2_pokemons[0].pokemon_v2_pokemontypes.map((item: Pokemon_V2_Pokemontype) => item.pokemon_v2_type?.name)],
        regions: [...poke.pokemon_v2_pokemondexnumbers.map((item: Pokemon_V2_Pokemondexnumber) => item.pokemon_v2_pokedex?.name)]
      }
    })
  }
})
rawToProcessedAtom.debugLabel = 'rawToProcessedAtom'

export const rawToProcessedVersionListAtom = atom(async (get) => {
  const res = await get(rawVersionList);
  if (res.data) {
    console.log(res.data)
    return res.data.pokemon_v2_versionname;
  }
})

export const rawPokemonList = atomWithQuery<AllPokemonSpeciesWithSpritesQuery>({
  query: gql`
    query allPokemonSpeciesWithSprites {
      pokemon_v2_pokemonspecies(order_by: {id: asc}) {
        name
        id
        pokemon_v2_pokemondexnumbers {
          pokemon_v2_pokedex {
            name
            id
            is_main_series
          }
        }
        pokemon_v2_pokemons {
          pokemon_v2_pokemonsprites {
            sprites(path: "other.official-artwork")
          }
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
              generation_id
            }
          }
        }
        has_gender_differences
        capture_rate
        base_happiness
      }
    }
    `
})

// Typegen

export const rawVersionList = atomWithQuery<AllVersionsEnglishNamesQuery>({
  query: gql`
  query allVersionsEnglishNames {
    pokemon_v2_versionname(where: {language_id: {_eq: 9}}) {
      name
      id
      language_id
      version_id
    }
  }
`
})

// const cache = new InMemoryCache();
// const client = new ApolloClient({ cache: cache, uri: 'https://beta.pokeapi.co/graphql/v1beta' });

// const rawVersionListQuery = gql`
// query allVersionsEnglishNames {
//   pokemon_v2_versionname(where: {language_id: {_eq: 9}}) {
//     name
//     id
//     language_id
//     version_id
//   }
// }
// `

// const rawVersionListQueryAtom = atomWithQuery(
//   (get) => ({ rawVersionListQuery }),
// )