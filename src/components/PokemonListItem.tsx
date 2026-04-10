import { Checkbox } from './ui/checkbox';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { app, Pokemon, setPokemonCaught } from '@/state';
import { useSelector } from '@legendapp/state/react';

export const PokemonListItem = ({ poke }: { poke: Pokemon }) => {
  const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);

  const handleCaught = () => {
    setPokemonCaught(poke.id, !caught);
  };

  return (
    <div className="pl-5 rounded-lg flex shadow-md">
      <div className="flex flex-col justify-center w-40">
        <Checkbox checked={caught} onCheckedChange={handleCaught} />
        <div className="text-lg font-bold">{poke.name}</div>
      </div>
      <div className="flex justify-end pr-2 w-40 bg-lightTransparent rounded-l-[100%]">
        <LazyLoadImage
          src={poke.sprites.front_default}
          alt={poke.name}
          width={100}
          height={100}
        />
      </div>
    </div>
  );
};
