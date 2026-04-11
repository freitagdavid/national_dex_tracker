import type { AllRegionsEnglishNamesQuery } from '@/gql/operation-types';
import { getRegionSlugsForVersionId, type VersionNameRow } from '@/state/versionRegionFilter';

type RegionRow = NonNullable<AllRegionsEnglishNamesQuery['pokemon_v2_region']>[number];

/** Rows from `pokemon_v2_pokemondexnumbers` on species detail. */
export type ModalDexNumberRow = {
  pokedex_number: number;
  pokemon_v2_pokedex?: {
    name?: string | null;
    is_main_series?: boolean | null;
    pokemon_v2_region?: { name?: string | null } | null;
  } | null;
};

/**
 * Pokédex numbers for the **info modal only**: driven by the modal’s selected game (`version_id`),
 * not the main list Region / Game filters.
 */
export function pickModalDexDisplay(
  dexRows: ModalDexNumberRow[] | undefined,
  versionRows: VersionNameRow[] | undefined,
  gqlRegionRows: RegionRow[] | undefined,
  modalVersionId: number,
  speciesIdFallback: number,
): {
  national: number;
  local: number | null;
  regionLabel: string | null;
  regionSlug: string | null;
  versionLabel: string | null;
} {
  const list = dexRows ?? [];
  let national = speciesIdFallback;
  const natRow = list.find((r) => r.pokemon_v2_pokedex?.name === 'national');
  if (natRow != null) national = natRow.pokedex_number;

  if (!versionRows || modalVersionId === 0) {
    return { national, local: null, regionLabel: null, regionSlug: null, versionLabel: null };
  }

  const versionLabel =
    versionRows.find((r) => r.version_id === modalVersionId)?.name ??
    `Version ${modalVersionId}`;

  const slugs = [...getRegionSlugsForVersionId(versionRows, modalVersionId)];
  slugs.sort();

  const perRegion: { slug: string; n: number }[] = [];
  for (const slug of slugs) {
    let minForSlug = Infinity;
    for (const row of list) {
      const dex = row.pokemon_v2_pokedex;
      if (!dex?.is_main_series) continue;
      if (dex.pokemon_v2_region?.name !== slug) continue;
      if (row.pokedex_number < minForSlug) minForSlug = row.pokedex_number;
    }
    if (minForSlug !== Infinity) perRegion.push({ slug, n: minForSlug });
  }

  if (perRegion.length === 0) {
    return {
      national,
      local: null,
      regionLabel: null,
      regionSlug: slugs[0] ?? null,
      versionLabel,
    };
  }

  perRegion.sort((a, b) => a.n - b.n || a.slug.localeCompare(b.slug));
  const chosen = perRegion[0];
  const regionLabel =
    gqlRegionRows?.find((x) => x.name === chosen.slug)?.pokemon_v2_regionnames[0]?.name ??
    chosen.slug;

  return {
    national,
    local: chosen.n,
    regionLabel,
    regionSlug: chosen.slug,
    versionLabel,
  };
}

export function mainSeriesDexRowsForTable(rows: ModalDexNumberRow[] | undefined): ModalDexNumberRow[] {
  return (rows ?? []).filter((r) => r.pokemon_v2_pokedex?.is_main_series === true);
}

export function buildMainSeriesDexTableRows(
  rows: ModalDexNumberRow[] | undefined,
  regionRows: RegionRow[] | undefined,
): Array<{
  key: string;
  regionLabel: string;
  dexName: string;
  num: number;
  regionSlug: string | null;
}> {
  return mainSeriesDexRowsForTable(rows)
    .map((r) => {
      const slug = r.pokemon_v2_pokedex?.pokemon_v2_region?.name ?? null;
      const regionLabel = slug
        ? (regionRows?.find((x) => x.name === slug)?.pokemon_v2_regionnames[0]?.name ?? slug)
        : '—';
      return {
        key: `${r.pokemon_v2_pokedex?.name ?? 'x'}-${r.pokedex_number}-${slug ?? 'nr'}`,
        regionLabel,
        dexName: r.pokemon_v2_pokedex?.name ?? '—',
        num: r.pokedex_number,
        regionSlug: slug,
      };
    })
    .sort(
      (a, b) =>
        a.regionLabel.localeCompare(b.regionLabel) ||
        a.dexName.localeCompare(b.dexName) ||
        a.num - b.num,
    );
}
