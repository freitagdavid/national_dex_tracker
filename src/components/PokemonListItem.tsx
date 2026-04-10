import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Circle, Star } from 'lucide-react';
import { type Pokemon, app, openPokemonInfo, setPokemonCaught, setPokemonFavorite } from '@/state';
import { useSelector } from '@legendapp/state/react';
import { cn } from '@/lib/utils';
import { usePokemonListImageTheme } from '@/hooks/usePokemonListImageTheme';
import { useListDexDisplayLabel } from '@/hooks/useListDexDisplayLabel';
import { usePokemonSpriteUrl } from '@/hooks/usePokemonSpriteUrl';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

function displaySpeciesName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Dark disc with the checkmark cut out so the card background shows through (“invisible” mark). */
function CaughtCutoutDisc({ fill, maskId }: { fill: string; maskId: string }) {
  return (
    <svg viewBox="0 0 28 28" className="h-5 w-5 shrink-0" aria-hidden>
      <title>Caught mark</title>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="12" fill="white" />
          <path
            d="M8.5 14.25 L12.75 18.5 L19.5 10"
            fill="none"
            stroke="black"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <circle cx="14" cy="14" r="12" fill={fill} mask={`url(#${maskId})`} />
    </svg>
  );
}

export const PokemonListItem = ({ poke }: { poke: Pokemon }) => {
  const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
  const favorite = useSelector(() => app.state.ui.favoriteById[poke.id].get() ?? false);

  const primaryType = poke.types.find(Boolean);
  const dexLabel = useListDexDisplayLabel(poke);
  const { url: spriteUrl, colorCacheKey } = usePokemonSpriteUrl(poke);
  const { theme, onArtLoad } = usePokemonListImageTheme(spriteUrl, primaryType, colorCacheKey);
  const typeLabels = poke.types.filter((t): t is string => Boolean(t));

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        'relative flex min-h-26 cursor-pointer overflow-hidden rounded-[1.35rem] border-0 py-0 pr-0 pl-4 shadow-md',
      )}
      style={{ backgroundColor: theme.cardBg, color: theme.text }}
      onClick={() => openPokemonInfo(poke.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPokemonInfo(poke.id);
        }
      }}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-2 py-3 pr-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="shrink-0 font-mono text-base font-semibold tabular-nums leading-none tracking-tight">
              {dexLabel}
            </span>
            <h2 className="min-w-0 flex-1 text-lg font-bold leading-none tracking-tight">
              {displaySpeciesName(poke.name)}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 pr-1">
            <button
              type="button"
              aria-label={favorite ? 'Remove favorite' : 'Add favorite'}
              aria-pressed={favorite}
              className="rounded-full p-1.5 transition-opacity hover:opacity-80"
              style={{ color: theme.text }}
              onClick={(e) => {
                e.stopPropagation();
                setPokemonFavorite(poke.id, !favorite);
              }}
            >
              <Star
                className="h-5 w-5"
                strokeWidth={2}
                fill={favorite ? 'currentColor' : 'none'}
              />
            </button>
            <button
              type="button"
              aria-label={caught ? 'Mark uncaught' : 'Mark caught'}
              aria-pressed={caught}
              className="rounded-full p-1.5 transition-opacity hover:opacity-80"
              style={caught ? undefined : { color: theme.text }}
              onClick={(e) => {
                e.stopPropagation();
                setPokemonCaught(poke.id, !caught);
              }}
            >
              {caught ? (
                <CaughtCutoutDisc fill={theme.text} maskId={`list-caught-cutout-${poke.id}`} />
              ) : (
                <Circle className="h-5 w-5" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {typeLabels.map((t) => (
            <span
              key={t}
              className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: theme.pillBg,
                borderColor: theme.pillBorder,
                color: theme.text,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex w-[34%] max-w-34 min-w-25 shrink-0 items-center justify-center self-stretch">
        <div
          className="absolute inset-y-0 right-0 w-[92%] rounded-l-full"
          style={{ backgroundColor: theme.artBlob }}
          aria-hidden
        />
        <LazyLoadImage
          key={`${poke.id}-${colorCacheKey}`}
          src={spriteUrl}
          alt={poke.name}
          width={128}
          height={128}
          crossOrigin="anonymous"
          className="relative z-10 h-26 w-26 object-contain drop-shadow-sm"
          onLoad={(e) => onArtLoad(e.currentTarget)}
          placeholder={<Skeleton className="h-26 w-26 rounded-lg bg-muted/80" aria-hidden />}
        />
      </div>
    </Card>
  );
};

/** Placeholder row matching list card layout (min height, art column width). */
export function PokemonListItemSkeleton() {
  return (
    <Card className="relative flex min-h-26 overflow-hidden rounded-[1.35rem] border-0 bg-muted/40 py-0 pr-0 pl-4 shadow-md">
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-2 py-3 pr-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <Skeleton className="h-5 w-11 shrink-0 rounded" />
            <Skeleton className="h-6 min-w-0 flex-1 max-w-[12rem] rounded-md" />
          </div>
          <div className="flex shrink-0 items-center gap-0.5 pr-1">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="relative flex w-[34%] max-w-34 min-w-25 shrink-0 items-center justify-center self-stretch">
        <Skeleton className="h-26 w-26 shrink-0 rounded-lg" />
      </div>
    </Card>
  );
}
