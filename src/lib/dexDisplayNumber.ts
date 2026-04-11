import type { Pokemon } from '@/state';

/**
 * List row dex #:
 * - Regional filter → that region’s pokédex order (main series).
 * - National (with or without a game filter) → national dex number (`species.id`).
 */
export function getListDexDisplayNumber(poke: Pokemon, selectedRegion: string): number {
  if (selectedRegion !== 'national') {
    const r = poke.dexNumberByRegion[selectedRegion];
    if (r != null) return r;
  }
  return poke.speciesId;
}

export function formatDexListLabel(n: number): string {
  return `#${String(n).padStart(Math.max(3, String(n).length), '0')}`;
}
