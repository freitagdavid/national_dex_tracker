import type { AllVersionsEnglishNamesQuery } from '@/gql/operation-types';

export type VersionNameRow = NonNullable<AllVersionsEnglishNamesQuery['pokemon_v2_versionname']>[number];

export function getRegionSlugsForVersionId(
  versionRows: VersionNameRow[] | undefined,
  versionId: number,
): Set<string> {
  const out = new Set<string>();
  if (!versionRows || versionId === 0) return out;
  const row = versionRows.find((r) => r.version_id === versionId);
  const regions =
    row?.pokemon_v2_version?.pokemon_v2_versiongroup?.pokemon_v2_versiongroupregions ?? [];
  for (const vgr of regions) {
    const name = vgr.pokemon_v2_region?.name;
    if (name) out.add(name);
  }
  return out;
}

export function versionNameRowMatchesRegionSlug(row: VersionNameRow, regionSlug: string): boolean {
  const regions =
    row.pokemon_v2_version?.pokemon_v2_versiongroup?.pokemon_v2_versiongroupregions ?? [];
  return regions.some((vgr) => vgr.pokemon_v2_region?.name === regionSlug);
}

export function getVersionGroupIdForVersionId(
  versionRows: VersionNameRow[] | undefined,
  versionId: number,
): number | undefined {
  if (!versionRows || versionId === 0) return undefined;
  const row = versionRows.find((r) => r.version_id === versionId);
  const gid = row?.pokemon_v2_version?.version_group_id;
  return gid ?? undefined;
}
