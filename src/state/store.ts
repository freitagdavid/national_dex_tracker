import type { AllPokemonSpeciesWithSpritesQuery, AllVersionsEnglishNamesQuery } from '@/gql/graphql';
import { batch, computed, observable } from '@legendapp/state';
import { configureObservablePersistence, persistObservable } from '@legendapp/state/persist';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

export const SPECIES_QUERY = `
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
`;

export const VERSIONS_QUERY = `
  query allVersionsEnglishNames {
    pokemon_v2_versionname(where: {language_id: {_eq: 9}}) {
      name
      id
      language_id
      version_id
    }
  }
`;

/** Persisted UI slice — own observable so persist does not share inline graph with `query`. */
const ui$ = observable({
  listLayout: 'box' as 'grid' | 'list' | 'box',
  selectedRegion: 'national' as string,
  selectedGame: 0,
  caughtById: {} as Record<number, boolean>,
  caughtNumber: 0,
  boxCaught: {} as Record<number, number>,
});

/** Server-backed query cache — not persisted. */
const query$ = observable({
  speciesData: undefined as AllPokemonSpeciesWithSpritesQuery | undefined,
  versionRows: undefined as AllVersionsEnglishNamesQuery['pokemon_v2_versionname'] | undefined,
});

/** Single tree: composed from explicit `ui$` + `query$` children. */
const state$ = observable({
  ui: ui$,
  query: query$,
});

persistObservable(ui$, { local: 'nationalDexTracker' });

export type Pokemon = {
  name: string;
  id: number;
  sprites: {
    front_default: string;
    front_shiny: string;
  };
  types: (string | undefined)[];
  regions: (string | undefined)[];
};

function pokemonSpeciesPayloadSig(species: AllPokemonSpeciesWithSpritesQuery['pokemon_v2_pokemonspecies']) {
  if (species == null || species.length === 0) return '0';
  const first = species[0];
  const last = species[species.length - 1];
  return `${species.length}:${first?.id}:${last?.id}`;
}

let processedCacheSig: string | undefined;
let processedCacheList: Pokemon[] | undefined;

function mapSpeciesRow(
  poke: NonNullable<AllPokemonSpeciesWithSpritesQuery['pokemon_v2_pokemonspecies']>[number],
): Pokemon | null {
  const mon = poke.pokemon_v2_pokemons?.[0];
  const spriteRow = mon?.pokemon_v2_pokemonsprites?.[0];
  const sprites = spriteRow?.sprites;
  if (!sprites?.front_default) return null;
  return {
    name: poke.name,
    id: poke.id,
    sprites: {
      front_default: sprites.front_default,
      front_shiny: sprites.front_shiny ?? sprites.front_default,
    },
    types: [...(mon?.pokemon_v2_pokemontypes ?? []).map((item) => item.pokemon_v2_type?.name)],
    regions: [...poke.pokemon_v2_pokemondexnumbers.map((item) => item.pokemon_v2_pokedex?.name)],
  };
}

const pokemonList$ = computed(() => {
  const data = state$.query.speciesData.get();
  if (!data) {
    processedCacheSig = undefined;
    processedCacheList = undefined;
    return [] as Pokemon[];
  }
  const species = data.pokemon_v2_pokemonspecies;
  if (species == null || species.length === 0) {
    processedCacheSig = undefined;
    processedCacheList = undefined;
    return [] as Pokemon[];
  }
  const sig = pokemonSpeciesPayloadSig(species);
  if (sig === processedCacheSig && processedCacheList) {
    return processedCacheList;
  }
  processedCacheSig = sig;
  const rows = species.map(mapSpeciesRow).filter((p): p is Pokemon => p != null);
  processedCacheList = rows;
  return processedCacheList;
});

/** Caught count for the current species list (derived from `caughtById`, not persisted `caughtNumber`). */
const caughtCount$ = computed(() => {
  const list = pokemonList$.get();
  if (list.length === 0) return 0;
  const byId = ui$.caughtById.peek();
  let n = 0;
  for (const p of list) {
    if (byId[p.id]) n++;
  }
  return n;
});

const numPokemon$ = computed(() => pokemonList$.get().length || 0);

const numBoxes$ = computed(() => Math.ceil(numPokemon$.get() / 30));

const boxes$ = computed(() => {
  const list = pokemonList$.get();
  const n = numBoxes$.get();
  const boxes: Pokemon[][] = [];
  for (let i = 0; i < n; i++) {
    boxes.push(list.slice(i * 30, i * 30 + 30));
  }
  return boxes;
});

/**
 * Monolithic app store: one observable tree (`state`) plus derived observables
 * for list/box views. Prefer `app.state.ui.*` / `app.state.query.*` over scattering roots.
 */
export const app = {
  state: state$,
  pokemonList: pokemonList$,
  caughtCount: caughtCount$,
  numPokemon: numPokemon$,
  numBoxes: numBoxes$,
  boxes: boxes$,
} as const;

export function pokemonSpeciesPayloadSignature(
  species: AllPokemonSpeciesWithSpritesQuery['pokemon_v2_pokemonspecies'],
) {
  return pokemonSpeciesPayloadSig(species);
}

export function isCaught(id: number): boolean {
  return app.state.ui.caughtById[id].get() ?? false;
}

/** Batch updates for caught flags and derived counts. */
export function setPokemonCaught(id: number, caught: boolean, boxNum?: number) {
  batch(() => {
    const byId = app.state.ui.caughtById.peek();
    const was = byId[id] ?? false;
    if (was === caught) return;
    app.state.ui.caughtById.assign({ ...byId, [id]: caught });
    const delta = caught ? 1 : -1;
    app.state.ui.caughtNumber.set(Math.max(0, app.state.ui.caughtNumber.peek() + delta));
    if (boxNum != null) {
      const byBox = app.state.ui.boxCaught.peek();
      const cur = byBox[boxNum] ?? 0;
      app.state.ui.boxCaught.assign({ ...byBox, [boxNum]: Math.max(0, Math.min(30, cur + delta)) });
    }
  });
}
