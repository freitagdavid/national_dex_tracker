import { app } from '@/state';
import { batch } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { useEffect } from 'react';
import {
  collectTypeSlugsFromPokemonList,
  listAfterVersionAndRegion,
  regionHasTypeInScope,
  versionHasTypeInScope,
} from '@/state/pokemonFilters';
import {
  getRegionSlugsForVersionId,
  versionNameRowMatchesRegionSlug,
  versionRowMatchesGenerationFilter,
} from '@/state/versionRegionFilter';

/** Keeps version, region, and type selections consistent with each other and dex data. */
export function SelectionReconcile() {
  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const selectedRegion = useSelector(() => app.state.ui.selectedRegion.get());
  const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
  const selectedTypeFilter = useSelector(() => app.state.ui.selectedTypeFilter.get());
  const selectedGenerations = useSelector(() => app.state.ui.selectedGenerations.get());
  const processedPokemon = useSelector(() => app.processedPokemonList.get());

  useEffect(() => {
    if (!versionRows) return;
    const rows = app.processedPokemonList.peek();
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

      sg = app.state.ui.selectedGame.peek();
      const gens = app.state.ui.selectedGenerations.peek();
      if (sg !== 0 && gens.length > 0) {
        const row = versionRows.find((r) => r.version_id === sg);
        if (!row || !versionRowMatchesGenerationFilter(row, gens)) {
          app.state.ui.selectedGame.set(0);
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

      if (rows.length === 0) return;

      sr = app.state.ui.selectedRegion.peek();
      sg = app.state.ui.selectedGame.peek();

      const scoped = listAfterVersionAndRegion(rows, sg, sr, versionRows);
      const availTypes = new Set(collectTypeSlugsFromPokemonList(scoped));

      let tf = app.state.ui.selectedTypeFilter.peek();
      if (tf !== 'all' && !availTypes.has(tf.toLowerCase())) {
        app.state.ui.selectedTypeFilter.set('all');
        tf = 'all';
      }

      if (tf === 'all') return;

      sr = app.state.ui.selectedRegion.peek();
      sg = app.state.ui.selectedGame.peek();

      if (sg !== 0 && !versionHasTypeInScope(rows, sg, sr, versionRows, tf)) {
        app.state.ui.selectedGame.set(0);
      }

      sr = app.state.ui.selectedRegion.peek();
      sg = app.state.ui.selectedGame.peek();
      if (sr !== 'national' && !regionHasTypeInScope(rows, sg, sr, versionRows, tf)) {
        app.state.ui.selectedRegion.set('national');
      }
    });
  }, [versionRows, selectedRegion, selectedGame, selectedTypeFilter, selectedGenerations, processedPokemon]);

  return null;
}
