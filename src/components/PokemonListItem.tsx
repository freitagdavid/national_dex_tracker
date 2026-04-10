import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { app, Pokemon, setPokemonCaught } from '@/state';
import { useSelector } from '@legendapp/state/react';

export const PokemonListItem = ({ poke }: { poke: Pokemon }) => {
  const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
  const controlId = `list-caught-${poke.id}`;

  const handleCaught = () => {
    setPokemonCaught(poke.id, !caught);
  };

  return (
    <Card className="flex overflow-hidden py-0 pl-5 pr-0 shadow-md">
      <div className="flex w-40 flex-col justify-center gap-3 py-4">
        <Checkbox id={controlId} checked={caught} onCheckedChange={handleCaught} />
        <Label htmlFor={controlId} className="cursor-pointer text-lg font-bold">
          {poke.name}
        </Label>
      </div>
      <div className="flex w-40 justify-end rounded-l-[100%] bg-lightTransparent pr-2">
        <LazyLoadImage
          src={poke.sprites.front_default}
          alt={poke.name}
          width={100}
          height={100}
        />
      </div>
    </Card>
  );
};
