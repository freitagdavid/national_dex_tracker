import { maxNationalSpeciesIdForSelectedGame } from './nationalDexGameScope';
import type { VersionNameRow } from './versionRegionFilter';
import { getVersionGroupIdForVersionId } from './versionRegionFilter';

/** Row shape used by dex filters (matches `Pokemon` from the store). */
export type PokeRow = {
  id: number;
  types: (string | undefined)[];
  dexRegions: string[];
  dexNumberByRegion: Record<string, number>;
  versionGroupIds: number[];
};

export function pokemonHasType(p: PokeRow, typeSlug: string): boolean {
  const u = typeSlug.toLowerCase();
  return p.types.some((t) => t?.toLowerCase() === u);
}

export function collectTypeSlugsFromPokemonList(list: PokeRow[]): string[] {
  const s = new Set<string>();
  for (const p of list) {
    for (const t of p.types) {
      if (t) s.add(t.toLowerCase());
    }
  }
  return [...s].sort((a, b) => a.localeCompare(b));
}

/** Pokémon list after version-group and regional dex scope (no type / favorite filters). */
export function listAfterVersionAndRegion(
  rows: PokeRow[],
  gameId: number,
  region: string,
  versionRows: VersionNameRow[] | undefined,
): Pokemon[] {
  let out = rows;
  if (region === 'national') {
    if (gameId !== 0) {
      const cap = maxNationalSpeciesIdForSelectedGame(gameId, versionRows);
      if (cap != null) {
        out = out.filter((p) => p.id <= cap);
      }
    }
    return [...out].sort((a, b) => a.id - b.id);
  }

  if (gameId !== 0) {
    const gid = getVersionGroupIdForVersionId(versionRows, gameId);
    if (gid != null) {
      out = out.filter((p) => p.versionGroupIds.includes(gid));
    }
  }
  out = out.filter((p) => p.dexRegions.includes(region));
  return [...out].sort((a, b) => {
    const na = a.dexNumberByRegion[region] ?? Number.POSITIVE_INFINITY;
    const nb = b.dexNumberByRegion[region] ?? Number.POSITIVE_INFINITY;
    if (na !== nb) return na - nb;
    return a.id - b.id;
  });
}

export function versionHasTypeInScope(
  allRows: Pokemon[],
  versionId: number,
  region: string,
  versionRows: VersionNameRow[] | undefined,
  typeSlug: string,
): boolean {
  const scoped = listAfterVersionAndRegion(allRows, versionId, region, versionRows);
  return scoped.some((p) => pokemonHasType(p, typeSlug));
}

export function regionHasTypeInScope(
  allRows: PokeRow[],
  gameId: number,
  regionSlug: string,
  versionRows: VersionNameRow[] | undefined,
  typeSlug: string,
): boolean {
  if (regionSlug === 'national') return true;
  const scoped = listAfterVersionAndRegion(allRows, gameId, regionSlug, versionRows);
  return scoped.some((p) => pokemonHasType(p, typeSlug));
}
