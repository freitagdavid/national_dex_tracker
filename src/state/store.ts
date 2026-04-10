import type {
  AllPokemonSpeciesWithSpritesQuery,
  AllRegionsEnglishNamesQuery,
  AllVersionsEnglishNamesQuery,
} from '@/gql/operation-types';
import { getVersionGroupIdForVersionId } from './versionRegionFilter';
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
        pokedex_number
        pokemon_v2_pokedex {
          is_main_series
          pokemon_v2_region {
            name
          }
          pokemon_v2_pokedexversiongroups {
            version_group_id
          }
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
      pokemon_v2_version {
        id
        version_group_id
        pokemon_v2_versiongroup {
          pokemon_v2_versiongroupregions {
            pokemon_v2_region {
              name
            }
          }
        }
      }
    }
  }
`;

export const REGIONS_QUERY = `
  query allRegionsEnglishNames {
    pokemon_v2_region(order_by: {id: asc}) {
      id
      name
      pokemon_v2_regionnames(where: {language_id: {_eq: 9}}) {
        name
      }
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
  regionRows: undefined as AllRegionsEnglishNamesQuery['pokemon_v2_region'] | undefined,
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
  /** Region slugs (e.g. kanto) from main-series regional dex rows. */
  dexRegions: string[];
  /** Min regional dex number per region slug (main-series dexes only). */
  dexNumberByRegion: Record<string, number>;
  /** Version group IDs from main-series dex rows (pokedex↔version group). */
  versionGroupIds: number[];
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

  const dexNumberByRegion: Record<string, number> = {};
  const versionGroupIdSet = new Set<number>();
  for (const row of poke.pokemon_v2_pokemondexnumbers ?? []) {
    const dex = row.pokemon_v2_pokedex;
    if (!dex?.is_main_series) continue;
    for (const pvg of dex.pokemon_v2_pokedexversiongroups ?? []) {
      const gid = pvg.version_group_id;
      if (gid != null) versionGroupIdSet.add(gid);
    }
    const regionName = dex.pokemon_v2_region?.name;
    if (!regionName) continue;
    const n = row.pokedex_number;
    const prev = dexNumberByRegion[regionName];
    if (prev === undefined || n < prev) dexNumberByRegion[regionName] = n;
  }
  const dexRegions = Object.keys(dexNumberByRegion);
  const versionGroupIds = [...versionGroupIdSet].sort((a, b) => a - b);

  return {
    name: poke.name,
    id: poke.id,
    sprites: {
      front_default: sprites.front_default,
      front_shiny: sprites.front_shiny ?? sprites.front_default,
    },
    types: (mon?.pokemon_v2_pokemontypes ?? []).map((item) => item.pokemon_v2_type?.name ?? undefined),
    dexRegions,
    dexNumberByRegion,
    versionGroupIds,
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
  let rows: Pokemon[];
  if (sig === processedCacheSig && processedCacheList) {
    rows = processedCacheList;
  } else {
    processedCacheSig = sig;
    rows = species.map(mapSpeciesRow).filter((p): p is Pokemon => p != null);
    processedCacheList = rows;
  }

  let out = rows;
  const gameId = ui$.selectedGame.get();
  const versionRows = state$.query.versionRows.get();
  if (gameId !== 0) {
    const gid = getVersionGroupIdForVersionId(versionRows, gameId);
    if (gid != null) {
      out = out.filter((p) => p.versionGroupIds.includes(gid));
    }
  }

  const selected = ui$.selectedRegion.get();
  if (selected === 'national') return out;

  const filtered = out.filter((p) => p.dexRegions.includes(selected));
  return [...filtered].sort((a, b) => {
    const na = a.dexNumberByRegion[selected] ?? Number.POSITIVE_INFINITY;
    const nb = b.dexNumberByRegion[selected] ?? Number.POSITIVE_INFINITY;
    if (na !== nb) return na - nb;
    return a.id - b.id;
  });
});

/** Caught count for the current species list (derived from `caughtById`, not persisted `caughtNumber`). */
const caughtCount$ = computed(() => {
  const list = pokemonList$.get() ?? [];
  if (list.length === 0) return 0;
  // Use .get() so this computed subscribes to `caughtById` updates (.peek() does not track).
  const byId = ui$.caughtById.get();
  let n = 0;
  for (const p of list) {
    if (byId[p.id]) n++;
  }
  return n;
});

const numPokemon$ = computed(() => (pokemonList$.get() ?? []).length || 0);

const numBoxes$ = computed(() => Math.ceil(numPokemon$.get() / 30));

const boxes$ = computed(() => {
  const list = pokemonList$.get() ?? [];
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
