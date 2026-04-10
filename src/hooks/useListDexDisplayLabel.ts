import { useSelector } from '@legendapp/state/react';
import type { Pokemon } from '@/state';
import { app } from '@/state';
import { formatDexListLabel, getListDexDisplayNumber } from '@/lib/dexDisplayNumber';

/** Formatted dex # for list rows (regional vs national). */
export function useListDexDisplayLabel(poke: Pokemon): string {
  const selectedRegion = useSelector(() => app.state.ui.selectedRegion.get());
  const n = getListDexDisplayNumber(poke, selectedRegion);
  return formatDexListLabel(n);
}
