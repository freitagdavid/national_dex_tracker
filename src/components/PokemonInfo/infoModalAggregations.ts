import type {
  PokemonSpeciesDetailQuery,
  PokemonSpeciesEncountersQuery,
} from '@/gql/operation-types';

export type VarietyRow = NonNullable<
  NonNullable<PokemonSpeciesDetailQuery['pokemon_v2_pokemonspecies']>[number]['pokemon_varieties']
>[number];

export type EncounterRow = NonNullable<
  NonNullable<PokemonSpeciesEncountersQuery['pokemon_v2_encounter']>[number]
>;

function capitalizeWords(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatVarietyLabel(variety: VarietyRow, speciesSlug: string): string {
  if (variety.is_default) return 'Default form';
  const sn = speciesSlug.toLowerCase();
  const vn = variety.name.toLowerCase();
  if (vn === sn) return 'Default form';
  if (vn.startsWith(`${sn}-`)) {
    const rest = variety.name.slice(speciesSlug.length + 1);
    return capitalizeWords(rest.replace(/-/g, ' '));
  }
  return capitalizeWords(variety.name.replace(/-/g, ' '));
}

export type AggregatedAbility = {
  abilityId: number;
  displayName: string;
  hiddenOnAny: boolean;
  minSlot: number;
};

/** More than one `pokemon` row for this species (e.g. regional / cosmetic forms). */
export function speciesHasMultipleForms(varieties: VarietyRow[]): boolean {
  return varieties.length > 1;
}

export type DefaultPokemonHeldItemRow =
  NonNullable<
    NonNullable<
      NonNullable<PokemonSpeciesDetailQuery['pokemon_v2_pokemonspecies']>[number]['default_pokemon']
    >[number]['pokemon_v2_pokemonitems']
  >[number];

export type AggregatedHeldItem = {
  itemSlug: string;
  displayName: string;
  minRarity: number;
  maxRarity: number;
};

/** One entry per item; rarity min/max across game rows (PokéAPI percentage chance). */
export function aggregateDefaultPokemonHeldItems(
  items: DefaultPokemonHeldItemRow[] | undefined,
): AggregatedHeldItem[] {
  const bySlug = new Map<string, { displayName: string; rarities: number[] }>();
  for (const row of items ?? []) {
    const slug = row.pokemon_v2_item?.name;
    if (!slug) continue;
    const displayName = row.pokemon_v2_item?.pokemon_v2_itemnames[0]?.name ?? slug;
    const rarity = row.rarity ?? 0;
    const cur = bySlug.get(slug);
    if (!cur) bySlug.set(slug, { displayName, rarities: [rarity] });
    else cur.rarities.push(rarity);
  }
  return [...bySlug.entries()]
    .map(([itemSlug, v]) => ({
      itemSlug,
      displayName: v.displayName,
      minRarity: Math.min(...v.rarities),
      maxRarity: Math.max(...v.rarities),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function aggregatePossibleAbilities(varieties: VarietyRow[]): AggregatedAbility[] {
  const byId = new Map<
    number,
    { displayName: string; hiddenOnAny: boolean; minSlot: number }
  >();

  for (const v of varieties) {
    for (const row of v.pokemon_v2_pokemonabilities) {
      const ab = row.pokemon_v2_ability;
      if (ab?.id == null) continue;
      const displayName = ab.pokemon_v2_abilitynames[0]?.name ?? ab.name;
      const slot = row.slot ?? 99;
      const cur = byId.get(ab.id);
      if (!cur) {
        byId.set(ab.id, {
          displayName,
          hiddenOnAny: !!row.is_hidden,
          minSlot: slot,
        });
      } else {
        cur.hiddenOnAny = cur.hiddenOnAny || !!row.is_hidden;
        cur.minSlot = Math.min(cur.minSlot, slot);
      }
    }
  }

  return [...byId.entries()]
    .map(([abilityId, v]) => ({
      abilityId,
      displayName: v.displayName,
      hiddenOnAny: v.hiddenOnAny,
      minSlot: v.minSlot,
    }))
    .sort((a, b) => a.minSlot - b.minSlot || a.displayName.localeCompare(b.displayName));
}

export function formatEncounterPlace(e: EncounterRow): string {
  const regionRaw = e.pokemon_v2_locationarea?.pokemon_v2_location?.pokemon_v2_region?.name ?? '';
  const loc =
    e.pokemon_v2_locationarea?.pokemon_v2_location?.pokemon_v2_locationnames[0]?.name ?? '';
  const area = e.pokemon_v2_locationarea?.pokemon_v2_locationareanames[0]?.name ?? '';
  const region = regionRaw ? capitalizeWords(regionRaw.replace(/-/g, ' ')) : 'Unknown region';
  if (loc && area && loc === area) return `${region} · ${loc}`;
  if (loc && area) return `${region} · ${loc} — ${area}`;
  return `${region} · ${loc || area || 'Unknown area'}`;
}

export function formatEncounterDetail(e: EncounterRow): string {
  const method =
    e.pokemon_v2_encounterslot?.pokemon_v2_encountermethod?.name?.replace(/-/g, ' ') ?? 'unknown';
  const lo = e.min_level ?? 0;
  const hi = e.max_level ?? lo;
  const lv = lo === hi ? `Lv. ${lo}` : `Lv. ${lo}–${hi}`;
  return `${method} · ${lv}`;
}

export type EncounterPlaceGroup = { place: string; lines: string[] };

export function groupEncountersForDisplay(
  encounters: EncounterRow[],
  varietyIdToLabel: Map<number, string>,
): EncounterPlaceGroup[] {
  const map = new Map<string, Set<string>>();
  const multiForm = varietyIdToLabel.size > 1;

  for (const e of encounters) {
    const place = formatEncounterPlace(e);
    const detail = formatEncounterDetail(e);
    const formPrefix =
      multiForm && varietyIdToLabel.has(e.pokemon_id)
        ? `[${varietyIdToLabel.get(e.pokemon_id)}] `
        : '';
    const line = `${formPrefix}${detail}`;
    const set = map.get(place) ?? new Set();
    set.add(line);
    map.set(place, set);
  }

  return [...map.entries()]
    .map(([place, set]) => ({
      place,
      lines: [...set].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.place.localeCompare(b.place));
}
