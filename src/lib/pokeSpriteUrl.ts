import type { VersionNameRow } from '@/state/versionRegionFilter';
import { getVersionGroupIdForVersionId } from '@/state/versionRegionFilter';
import { VERSION_GROUP_SPRITE_PATHS } from '@/state/versionGroupSprites';

function getAtPath(root: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = root;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function readFrontDefault(node: unknown): string | undefined {
  if (node == null || typeof node !== 'object') return undefined;
  const fd = (node as Record<string, unknown>).front_default;
  return typeof fd === 'string' && fd.length > 0 ? fd : undefined;
}

function readFrontShiny(node: unknown): string | undefined {
  if (node == null || typeof node !== 'object') return undefined;
  const fs = (node as Record<string, unknown>).front_shiny;
  return typeof fs === 'string' && fs.length > 0 ? fs : undefined;
}

function readFrontFemale(node: unknown): string | undefined {
  if (node == null || typeof node !== 'object') return undefined;
  const v = (node as Record<string, unknown>).front_female;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function readFrontShinyFemale(node: unknown): string | undefined {
  if (node == null || typeof node !== 'object') return undefined;
  const v = (node as Record<string, unknown>).front_shiny_female;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * Sprite object for the selected game (or official artwork when no game / no era match).
 * Same leaf used for `front_default`, `front_shiny`, and gender-specific fronts.
 */
export function resolveSpriteLeafForVersion(
  spritesRoot: unknown,
  selectedGameVersionId: number,
  versionRows: VersionNameRow[] | undefined,
): unknown {
  if (selectedGameVersionId === 0) {
    return getAtPath(spritesRoot, 'other.official-artwork');
  }
  const vg = getVersionGroupIdForVersionId(versionRows, selectedGameVersionId);
  if (vg == null) {
    return getAtPath(spritesRoot, 'other.official-artwork');
  }
  const paths = VERSION_GROUP_SPRITE_PATHS[vg];
  if (paths) {
    for (const p of paths) {
      const node = getAtPath(spritesRoot, p);
      if (readFrontDefault(node)) return node;
    }
  }
  return getAtPath(spritesRoot, 'other.official-artwork');
}

export type SpriteVariationEntry = {
  key: 'default' | 'shiny' | 'female' | 'shiny-female';
  label: string;
  url: string;
};

/** Distinct front sprites for the era (default, shiny, female, shiny female). */
export function listSpriteVariationsForVersion(
  spritesRoot: unknown,
  selectedGameVersionId: number,
  versionRows: VersionNameRow[] | undefined,
): SpriteVariationEntry[] {
  const leaf = resolveSpriteLeafForVersion(spritesRoot, selectedGameVersionId, versionRows);
  if (leaf == null || typeof leaf !== 'object') return [];

  const def = readFrontDefault(leaf);
  const shiny = readFrontShiny(leaf);
  const female = readFrontFemale(leaf);
  const shinyFemale = readFrontShinyFemale(leaf);

  const out: SpriteVariationEntry[] = [];
  const seen = new Set<string>();

  const push = (key: SpriteVariationEntry['key'], label: string, url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ key, label, url });
  };

  push('default', 'Default', def);
  push('shiny', 'Shiny', shiny);
  push('female', 'Female', female);
  push('shiny-female', 'Shiny (female)', shinyFemale);
  return out;
}

/** Official artwork URL used when no game is selected or no era-specific sprite exists. */
export function getOfficialArtworkUrl(spritesRoot: unknown): string | undefined {
  const oa = getAtPath(spritesRoot, 'other.official-artwork');
  return readFrontDefault(oa);
}

export function getOfficialArtworkShinyUrl(spritesRoot: unknown): string | undefined {
  const oa = getAtPath(spritesRoot, 'other.official-artwork');
  return readFrontShiny(oa);
}

/**
 * Sprite URL for list/cards: era-appropriate when a game is selected, otherwise official artwork.
 */
export function resolvePokemonSpriteUrl(
  spritesRoot: unknown,
  selectedGameVersionId: number,
  versionRows: VersionNameRow[] | undefined,
): string | undefined {
  const official = getOfficialArtworkUrl(spritesRoot);
  return readFrontDefault(resolveSpriteLeafForVersion(spritesRoot, selectedGameVersionId, versionRows)) ?? official;
}
