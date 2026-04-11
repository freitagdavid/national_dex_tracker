import { SkeletonCard } from '@/components/PokemonCard';
import { Card } from '@/components/ui/card';
import { PokemonListItemSkeleton } from '@/components/PokemonListItem';

const LIST_PLACEHOLDER_COUNT = 10;
const GRID_PLACEHOLDER_COUNT = 24;

export function AppLoadingSkeleton({ layout }: { layout: 'box' | 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="flex w-full flex-col gap-3 px-3 py-4 sm:px-4">
        {Array.from({ length: LIST_PLACEHOLDER_COUNT }, (_, i) => (
          <PokemonListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="flex w-full flex-wrap justify-around px-2 py-2">
        {Array.from({ length: GRID_PLACEHOLDER_COUNT }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // box: mirror Box layout — one collapsible-style card with a grid of placeholders
  const boxSlice = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="flex w-full flex-wrap justify-around px-2 py-2">
      <Card className="mt-8 mb-8 w-11/12 max-w-304 overflow-hidden p-0 shadow-md">
        <div className="h-14 w-full bg-accent/80" />
        <div className="flex flex-wrap justify-evenly py-2">
          {boxSlice.map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}
