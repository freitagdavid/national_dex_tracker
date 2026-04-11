import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import type { Pokemon } from '@/state';
import { app, openPokemonInfo, setPokemonCaught } from '@/state';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useSelector } from '@legendapp/state/react';
import { usePokemonSpriteUrl } from '@/hooks/usePokemonSpriteUrl';

export const SkeletonCard = () => {
  return (
    <Card className="aspect-square flex flex-col align-middle justify-between w-44 mt-3">
      <CardHeader className="py-2">
        <Skeleton className="w-full text-center h-6" />
      </CardHeader>
      <Separator />
      <CardContent className="px-0 pb-0 flex justify-center">
        <Skeleton className="w-[100px] h-[100px]" />
      </CardContent>
      <Separator />
      <CardFooter className="w-full flex justify-center pb-0 px-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};

export const PokemonCard = ({ poke, boxNum }: { poke: Pokemon; boxNum: number }) => {
  const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
  const { url: spriteUrl } = usePokemonSpriteUrl(poke);
  const [, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleCaught = () => {
    setPokemonCaught(poke.id, !caught, boxNum);
  };

  return (
    <Card
      className="relative aspect-square flex flex-col align-middle justify-between w-44 mt-3"
      onClick={handleCaught}
    >
      <button
        type="button"
        aria-label={`${poke.displayName} details`}
        className="absolute top-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-sm transition-opacity hover:opacity-90"
        onClick={(e) => {
          e.stopPropagation();
          openPokemonInfo(poke.speciesId, poke.id);
        }}
      >
        <Info className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </button>
      <CardHeader className="py-2">
        <CardTitle className="w-full text-center">
          {poke.displayName}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-0 pb-0 flex justify-center">
        <LazyLoadImage
          src={spriteUrl}
          alt={poke.displayName}
          className="w-[100px] h-[100px]"
          width={100}
          height={100}
          onLoad={handleLoad}
          placeholder={<Skeleton className="w-[100px] h-[100px]" />}
        />
      </CardContent>
      <Separator />
      <CardFooter className="w-full flex justify-center pb-0 px-0">
        <Button
          className={cn(
            'w-full',
            caught ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700',
          )}
        >
          {caught ? 'Caught' : 'Uncaught'}
        </Button>
      </CardFooter>
    </Card>
  );
};
