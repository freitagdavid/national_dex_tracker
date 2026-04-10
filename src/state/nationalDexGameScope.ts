import type { VersionNameRow } from './versionRegionFilter';
import { getVersionGroupIdForVersionId } from './versionRegionFilter';

/**
 * Highest species `id` in the National Pokédex as of that version group’s generation
 * (PokeAPI species id ≈ national dex # for main-line species).
 *
 * @see https://pokeapi.co/api/v2/version-group/
 */
export const NATIONAL_DEX_MAX_SPECIES_ID_BY_VERSION_GROUP: Record<number, number> = {
  1: 151, // red-blue
  2: 151, // yellow
  3: 251, // gold-silver
  4: 251, // crystal
  5: 386, // ruby-sapphire
  6: 386, // emerald
  7: 386, // firered-leafgreen
  8: 493, // diamond-pearl
  9: 493, // platinum
  10: 493, // heartgold-soulsilver
  11: 649, // black-white
  12: 386, // colosseum
  13: 386, // xd
  14: 649, // black-2-white-2
  15: 721, // x-y
  16: 721, // omega-ruby-alpha-sapphire
  17: 807, // sun-moon
  18: 809, // ultra-sun-ultra-moon
  19: 809, // lets-go
  20: 898, // sword-shield
  21: 898, // isle of armor
  22: 898, // crown tundra
  23: 493, // brilliant-diamond-shining-pearl (Sinnoh-era cap)
  24: 905, // legends-arceus
  25: 1025, // scarlet-violet
  26: 1025, // teal mask
  27: 1025, // indigo disk
  28: 151, // red-green-japan
  29: 151, // blue-japan
  30: 1025, // legends-za
};

/** Max national species id for the selected game, or `undefined` if “all games” / unknown group. */
export function maxNationalSpeciesIdForSelectedGame(
  selectedGameVersionId: number,
  versionRows: VersionNameRow[] | undefined,
): number | undefined {
  if (selectedGameVersionId === 0) return undefined;
  const gid = getVersionGroupIdForVersionId(versionRows, selectedGameVersionId);
  if (gid == null) return undefined;
  return NATIONAL_DEX_MAX_SPECIES_ID_BY_VERSION_GROUP[gid];
}
