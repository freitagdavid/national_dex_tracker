import { app } from '@/state';
import { batch } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { useEffect } from 'react';
import {
  getRegionSlugsForVersionId,
  versionNameRowMatchesRegionSlug,
} from '@/state/versionRegionFilter';

/** Keeps selectedRegion / selectedGame consistent with cross-filter rules. */
export function SelectionReconcile() {
  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const selectedRegion = useSelector(() => app.state.ui.selectedRegion.get());
  const selectedGame = useSelector(() => app.state.ui.selectedGame.get());

  useEffect(() => {
    if (!versionRows) return;
    batch(() => {
      let sr = app.state.ui.selectedRegion.peek();
      let sg = app.state.ui.selectedGame.peek();

      if (sr !== 'national' && sg !== 0) {
        const row = versionRows.find((r) => r.version_id === sg);
        if (!row || !versionNameRowMatchesRegionSlug(row, sr)) {
          app.state.ui.selectedGame.set(0);
          sg = 0;
        }
      }

      sr = app.state.ui.selectedRegion.peek();
      sg = app.state.ui.selectedGame.peek();
      if (sg !== 0 && sr !== 'national') {
        const slugs = getRegionSlugsForVersionId(versionRows, sg);
        if (!slugs.has(sr)) {
          app.state.ui.selectedRegion.set('national');
        }
      }
    });
  }, [versionRows, selectedRegion, selectedGame]);

  return null;
}
