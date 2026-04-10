import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import type { Pokemon } from '@/state';
import { app, setPokemonCaught } from '@/state';
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
        <Skeleton className="w-full" />
      </CardFooter>
    </Card>
  );
};

export const PokemonCard = ({ poke, boxNum }: { poke: Pokemon; boxNum: number }) => {
  const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
  const spriteUrl = usePokemonSpriteUrl(poke);
  const [, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleCaught = () => {
    setPokemonCaught(poke.id, !caught, boxNum);
  };

  return (
    <Card
      className="aspect-square flex flex-col align-middle justify-between w-44 mt-3"
      onClick={handleCaught}
    >
      <CardHeader className="py-2">
        <CardTitle className="w-full text-center">
          {poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-0 pb-0 flex justify-center">
        <LazyLoadImage
          src={spriteUrl}
          alt={poke.name}
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
