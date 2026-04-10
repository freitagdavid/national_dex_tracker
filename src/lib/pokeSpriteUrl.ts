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
  if (selectedGameVersionId === 0) {
    return official;
  }
  const vg = getVersionGroupIdForVersionId(versionRows, selectedGameVersionId);
  if (vg == null) {
    return official;
  }
  const paths = VERSION_GROUP_SPRITE_PATHS[vg];
  if (paths) {
    for (const p of paths) {
      const url = readFrontDefault(getAtPath(spritesRoot, p));
      if (url) return url;
    }
  }
  return official;
}
