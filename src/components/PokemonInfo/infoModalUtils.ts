import type { VersionNameRow } from '@/state/versionRegionFilter';
import {
  getVersionGroupGenerationId,
  getVersionGroupIdForVersionId,
} from '@/state/versionRegionFilter';

export function formatFlavorText(raw: string): string {
  return raw.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
}

export function genderRateLabel(genderRate: number | null | undefined): string {
  if (genderRate == null) return '—';
  if (genderRate === -1) return 'Gender unknown';
  if (genderRate === 0) return '100% male';
  if (genderRate === 8) return '100% female';
  const femalePct = (genderRate / 8) * 100;
  const malePct = 100 - femalePct;
  return `${Math.round(malePct)}% male / ${Math.round(femalePct)}% female`;
}

export function maxFlavorVersionId(
  rows: ReadonlyArray<{ version_id: number }>,
): number | null {
  if (rows.length === 0) return null;
  return Math.max(...rows.map((r) => r.version_id));
}

/** When `selectedVersionId === 0`, use the latest English flavor row’s `version_id`. */
export function effectiveFlavorVersionId(
  selectedVersionId: number,
  flavorRows: ReadonlyArray<{ version_id: number }>,
): number | null {
  if (flavorRows.length === 0) return null;
  if (selectedVersionId !== 0) return selectedVersionId;
  return maxFlavorVersionId(flavorRows);
}

/** Generation of the game used for modal flavor (same `version_id` as `effectiveFlavorVersionId`). */
export function effectiveCryGameGenerationId(
  selectedVersionId: number,
  flavorRows: ReadonlyArray<{ version_id: number }>,
  versionRows: VersionNameRow[] | undefined,
): number | undefined {
  const vid = effectiveFlavorVersionId(selectedVersionId, flavorRows);
  if (vid == null) return undefined;
  const row = versionRows?.find((r) => r.version_id === vid);
  if (!row) return undefined;
  return getVersionGroupGenerationId(row);
}

/**
 * PokéAPI exposes `legacy` (pre–Gen VI style) and `latest` (modern). Pick by the selected game’s generation.
 */
export function pickPokemonCryUrl(
  cries: { latest?: string | null; legacy?: string | null } | null | undefined,
  gameGenerationId: number | undefined,
): string | null {
  const latest = cries?.latest ?? null;
  const legacy = cries?.legacy ?? null;
  const preferLegacy =
    gameGenerationId != null && gameGenerationId > 0 && gameGenerationId <= 5;
  if (preferLegacy) return legacy ?? latest;
  return latest ?? legacy;
}

export function flavorRowForVersion(
  flavorRows: ReadonlyArray<{ flavor_text: string; version_id: number }>,
  versionId: number | null,
): { flavor_text: string; version_id: number } | undefined {
  if (versionId == null) return undefined;
  const exact = flavorRows.filter((r) => r.version_id === versionId);
  if (exact.length === 0) return undefined;
  return exact[exact.length - 1];
}

export function effectiveVersionGroupIdForMoves(
  selectedVersionId: number,
  flavorRows: ReadonlyArray<{ version_id: number }>,
  versionRows: VersionNameRow[] | undefined,
): number | undefined {
  const vid =
    selectedVersionId !== 0
      ? selectedVersionId
      : maxFlavorVersionId(flavorRows) ?? undefined;
  if (vid == null) return undefined;
  return getVersionGroupIdForVersionId(versionRows, vid);
}

export function displayHeightDm(dm: number | null | undefined): string {
  if (dm == null) return '—';
  return `${(dm / 10).toFixed(1)} m`;
}

export function displayWeightHg(hg: number | null | undefined): string {
  if (hg == null) return '—';
  return `${(hg / 10).toFixed(1)} kg`;
}
