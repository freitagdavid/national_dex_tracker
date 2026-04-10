import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { app, setPokemonMovesModalOpen } from '@/state';
import { useSelector } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/state/graphqlFetch';
import type { PokemonSpeciesMovesQuery } from '@/gql/operation-types';
import { POKEMON_SPECIES_MOVES_QUERY } from '@/components/PokemonInfo/detailQueries';
import { useMemo } from 'react';

function displayMoveName(row: NonNullable<PokemonSpeciesMovesQuery['pokemon_v2_pokemonmove']>[number]) {
  return row.pokemon_v2_move?.pokemon_v2_movenames[0]?.name ?? '—';
}

function methodLabel(
  row: NonNullable<PokemonSpeciesMovesQuery['pokemon_v2_pokemonmove']>[number],
): string {
  return row.pokemon_v2_movelearnmethod?.name ?? `method ${row.move_learn_method_id ?? '?'}`;
}

function PokemonMovesModalSkeleton() {
  return (
    <div className="flex flex-col gap-6 pr-3" aria-hidden>
      {Array.from({ length: 3 }, (_, g) => (
        <section key={g}>
          <Skeleton className="mb-3 h-4 w-36" />
          <ul className="space-y-2">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="flex justify-between gap-2 border-b border-border/30 py-1">
                <Skeleton className="h-4 w-32 max-w-[55%]" />
                <Skeleton className="h-4 w-10 shrink-0" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function PokemonMovesModal({
  pokemonId,
  versionGroupId,
}: {
  pokemonId: number | null;
  versionGroupId: number | undefined;
}) {
  const movesOpen = useSelector(() => app.state.infoModal.movesOpen.get());

  const movesQuery = useQuery({
    queryKey: ['pokemonSpeciesMoves', pokemonId, versionGroupId],
    queryFn: () => {
      if (pokemonId == null || versionGroupId == null) {
        throw new Error('Missing move query parameters');
      }
      return graphqlRequest<PokemonSpeciesMovesQuery>(POKEMON_SPECIES_MOVES_QUERY, {
        pokemonId,
        versionGroupId,
      });
    },
    enabled: movesOpen && pokemonId != null && versionGroupId != null,
    staleTime: 60 * 60 * 1000,
  });

  const rows = movesQuery.data?.pokemon_v2_pokemonmove ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const r of rows) {
      const k = methodLabel(r);
      const cur = map.get(k) ?? [];
      cur.push(r);
      map.set(k, cur);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <Dialog
      open={movesOpen}
      onOpenChange={(o) => {
        if (!o) setPokemonMovesModalOpen(false);
      }}
    >
      <DialogContent
        className="max-h-[85vh] max-w-lg gap-3 border-0 p-0"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
        onPointerDownOutside={(e) => e.stopPropagation()}
      >
        <DialogHeader className="space-y-1 px-6 pt-6 pr-14">
          <DialogTitle>Moves in this version group</DialogTitle>
          <p className="text-muted-foreground text-left text-sm">
            Learnset for the selected game’s version group (via PokéAPI).
          </p>
        </DialogHeader>
        <ScrollArea className="min-h-[280px] max-h-[60vh] px-6 pb-6">
          {movesQuery.isLoading && <PokemonMovesModalSkeleton />}
          {!movesQuery.isLoading && movesQuery.isError && (
            <p className="text-destructive text-sm">
              {(movesQuery.error as Error)?.message ?? 'Failed to load moves.'}
            </p>
          )}
          {!movesQuery.isLoading && movesQuery.isSuccess && grouped.length === 0 && (
            <p className="text-muted-foreground text-sm">No moves listed for this version group.</p>
          )}
          {!movesQuery.isLoading && grouped.length > 0 && (
            <div className="flex flex-col gap-4 pr-3">
              {grouped.map(([method, list]) => (
                <section key={method}>
                  <h3 className="mb-2 text-sm font-semibold capitalize">{method.replace(/-/g, ' ')}</h3>
                  <ul className="space-y-1.5 text-sm">
                    {list.map((r) => (
                      <li key={r.id} className="flex justify-between gap-2 border-b border-border/40 py-1">
                        <span className="font-medium">{displayMoveName(r)}</span>
                        {r.move_learn_method_id === 1 && r.level != null && r.level > 0 && (
                          <span className="text-muted-foreground shrink-0">Lv. {r.level}</span>
                        )}
                        {r.move_learn_method_id === 1 && (r.level === 0 || r.level == null) && (
                          <span className="text-muted-foreground shrink-0">Evolve / start</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
