import type {
  AllPokemonSpeciesWithSpritesQuery,
  AllRegionsEnglishNamesQuery,
  AllVersionsEnglishNamesQuery,
} from '@/gql/operation-types';
import { getOfficialArtworkShinyUrl, getOfficialArtworkUrl } from '@/lib/pokeSpriteUrl';
import {
  collectTypeSlugsFromPokemonList,
  pokemonHasType,
} from './pokemonFilters';
import { maxNationalSpeciesIdForSelectedGame } from './nationalDexGameScope';
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
      generation_id
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
          sprites
        }
        pokemon_v2_pokemontypes(order_by: {slot: asc}) {
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
          generation_id
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

export type FavoriteFilter = 'all' | 'favorites' | 'unfavorites';

/** Persisted UI slice — own observable so persist does not share inline graph with `query`. */
const ui$ = observable({
  listLayout: 'box' as 'grid' | 'list' | 'box',
  selectedRegion: 'national' as string,
  selectedGame: 0,
  favoriteFilter: 'all' as FavoriteFilter,
  /** `'all'` or lowercase type name (e.g. `fire`). */
  selectedTypeFilter: 'all' as 'all' | string,
  /** Empty = all generations; otherwise PokeAPI `generation_id` values (1–9), sorted unique. */
  selectedGenerations: [] as number[],
  caughtById: {} as Record<number, boolean>,
  favoriteById: {} as Record<number, boolean>,
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
  /** Full PokeAPI `sprites` JSON (version-specific + other.*). */
  spritesJson: unknown;
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
  /** Introduced in this generation (`pokemon_v2_pokemonspecies.generation_id`). */
  generationId: number;
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
  const generationId = poke.generation_id;
  if (generationId == null) return null;
  const mon = poke.pokemon_v2_pokemons?.[0];
  if (!mon) return null;
  const spriteRow = mon?.pokemon_v2_pokemonsprites?.[0];
  const spritesRoot = spriteRow?.sprites;
  const officialUrl = getOfficialArtworkUrl(spritesRoot);
  if (!officialUrl) return null;

  const frontShiny = getOfficialArtworkShinyUrl(spritesRoot) ?? officialUrl;

  const dexNumberByRegion: Record<string, number> = {};
  const versionGroupIdSet = new Set<number>();
  for (const row of poke.pokemon_v2_pokemondexnumbers ?? []) {
    const dex = row.pokemon_v2_pokedex;
    if (!dex?.is_main_series) continue;
    for (const pvg of dex.pokemon_v2_pokedexversiongroups ?? []) {
      const gid = pvg.version_group_id;
      if (gid != null) versionGroupIdSet.add(gid);
    }
    const regionSlug = dex.pokemon_v2_region?.name;
    if (!regionSlug) continue;
    const n = row.pokedex_number;
    const prev = dexNumberByRegion[regionSlug];
    if (prev === undefined || n < prev) dexNumberByRegion[regionSlug] = n;
  }
  const dexRegions = Object.keys(dexNumberByRegion);
  const versionGroupIds = [...versionGroupIdSet].sort((a, b) => a - b);

  return {
    name: poke.name,
    id: poke.id,
    spritesJson: spritesRoot,
    sprites: {
      front_default: officialUrl,
      front_shiny: frontShiny,
    },
    types: (mon?.pokemon_v2_pokemontypes ?? []).map((item) => item.pokemon_v2_type?.name ?? undefined),
    dexRegions,
    dexNumberByRegion,
    versionGroupIds,
    generationId,
  };
}

/** Full species list (sprites + dex metadata), before version/region/type/favorite UI filters. */
const processedPokemonList$ = computed((): Pokemon[] => {
  const data = state$.query.speciesData.get();
  if (!data) {
    processedCacheSig = undefined;
    processedCacheList = undefined;
    return [];
  }
  const species = data.pokemon_v2_pokemonspecies;
  if (species == null || species.length === 0) {
    processedCacheSig = undefined;
    processedCacheList = undefined;
    return [];
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
  return rows;
});

/** After game version + regional dex only (drives type options and cross-filters). */
const pokemonScoped$ = computed((): Pokemon[] => {
  const rows = processedPokemonList$.get();
  if (rows.length === 0) return rows;
  let out = rows;
  const gameId = ui$.selectedGame.get();
  const versionRows = state$.query.versionRows.get();
  const selected = ui$.selectedRegion.get();

  // Regional dex: limit to species in that game + region (Hoenn #001 Treecko, etc.).
  // National dex: full national order; with a game selected, cap by that era’s generation (e.g. RS → #386).
  if (selected !== 'national') {
    if (gameId !== 0) {
      const gid = getVersionGroupIdForVersionId(versionRows, gameId);
      if (gid != null) {
        out = out.filter((p) => p.versionGroupIds.includes(gid));
      }
    }
    out = out.filter((p) => p.dexRegions.includes(selected));
    out = [...out].sort((a, b) => {
      const na = a.dexNumberByRegion[selected] ?? Number.POSITIVE_INFINITY;
      const nb = b.dexNumberByRegion[selected] ?? Number.POSITIVE_INFINITY;
      if (na !== nb) return na - nb;
      return a.id - b.id;
    });
  } else {
    if (gameId !== 0) {
      const cap = maxNationalSpeciesIdForSelectedGame(gameId, versionRows);
      if (cap != null) {
        out = out.filter((p) => p.id <= cap);
      }
    }
    out = [...out].sort((a, b) => a.id - b.id);
  }
  return out;
});

const pokemonList$ = computed(() => {
  let out = pokemonScoped$.get();

  const generations = ui$.selectedGenerations.get();
  if (generations.length > 0) {
    const set = new Set(generations);
    out = out.filter((p) => set.has(p.generationId));
  }

  const typeFilter = ui$.selectedTypeFilter.get();
  if (typeFilter !== 'all') {
    out = out.filter((p) => pokemonHasType(p, typeFilter));
  }

  const favoriteFilter = ui$.favoriteFilter.get();
  if (favoriteFilter !== 'all') {
    const favoriteById = ui$.favoriteById.get();
    if (favoriteFilter === 'favorites') {
      out = out.filter((p) => favoriteById[p.id]);
    } else {
      out = out.filter((p) => !favoriteById[p.id]);
    }
  }

  return out;
});

/** Type slugs for the current scope including generation filter (for the type picker). */
const availableTypeSlugs$ = computed(() => {
  let list = pokemonScoped$.get();
  const generations = ui$.selectedGenerations.get();
  if (generations.length > 0) {
    const set = new Set(generations);
    list = list.filter((p) => set.has(p.generationId));
  }
  return collectTypeSlugsFromPokemonList(list);
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
  processedPokemonList: processedPokemonList$,
  pokemonScoped: pokemonScoped$,
  availableTypeSlugs: availableTypeSlugs$,
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

export function setPokemonFavorite(id: number, favorite: boolean) {
  const byId = app.state.ui.favoriteById.peek();
  const was = byId[id] ?? false;
  if (was === favorite) return;
  app.state.ui.favoriteById.assign({ ...byId, [id]: favorite });
}
