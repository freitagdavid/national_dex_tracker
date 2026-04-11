import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Skeleton } from '@/components/ui/skeleton';
import { useChromaKeyedSpriteUrl } from '@/hooks/usePokemonSpriteUrl';
import type { SpriteVariationEntry } from '@/lib/pokeSpriteUrl';

function VariationTile({
  entry,
  artBlob,
  themeText,
}: {
  entry: SpriteVariationEntry;
  artBlob: string;
  themeText: string;
}) {
  const { displayUrl } = useChromaKeyedSpriteUrl(entry.url);
  if (!displayUrl) return null;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-22 w-22 items-center justify-center rounded-xl"
        style={{ backgroundColor: artBlob }}
      >
        <LazyLoadImage
          src={displayUrl}
          alt={`${entry.label} sprite`}
          width={80}
          height={80}
          crossOrigin="anonymous"
          className="h-16 w-16 object-contain drop-shadow-sm"
          placeholder={<Skeleton className="h-16 w-16 rounded-lg opacity-30" />}
        />
      </div>
      <span
        className="max-w-24 text-center text-[11px] leading-tight opacity-85"
        style={{ color: themeText }}
      >
        {entry.label}
      </span>
    </div>
  );
}

export function InfoModalSpriteVariations({
  entries,
  artBlob,
  themeText,
}: {
  entries: SpriteVariationEntry[];
  artBlob: string;
  themeText: string;
}) {
  if (entries.length <= 1) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold" style={{ color: themeText }}>
        Sprite variations
      </h3>
      <p className="text-xs opacity-75" style={{ color: themeText }}>
        Shiny and gender-specific fronts for this game selection (PokéAPI).
      </p>
      <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
        {entries.map((e) => (
          <VariationTile key={e.key} entry={e} artBlob={artBlob} themeText={themeText} />
        ))}
      </div>
    </section>
  );
}
