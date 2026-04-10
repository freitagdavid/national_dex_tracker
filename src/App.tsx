import { useSelector } from '@legendapp/state/react';
import './App.css';
import { app } from '@/state';
import { StatefuleProgress } from './components/StatefulProgress';
import { Box } from './components/Box';
import { AppBar } from './components/MenuBar';
import { PokemonCard } from './components/PokemonCard';
import { PokemonListItem } from './components/PokemonListItem';

function App() {
  const pokemon = useSelector(() => app.pokemonList.get() ?? []);
  const boxes = useSelector(() => app.boxes.get() ?? []);
  const layout = useSelector(() => app.state.ui.listLayout.get());

  return (
    <>
      <div className="w-screen h-screen">
        <div className="w-full">
          <div className="bg-accent w-full h-16 flex justify-center items-center shadow-md">
            <p className="text-primary">National Dex Tracker</p>
          </div>
          <StatefuleProgress
            numPokemon={pokemon.length || 0}
            fillClassName="bg-green-500"
            className="rounded-none bg-red-500"
          />
          <AppBar />
        </div>
        {layout === 'box' && (
          <div className="w-full flex flex-wrap overflow-scroll h-full justify-around">
            {boxes.map((box, boxIndex) => (
              <Box box={box} boxNum={boxIndex} key={boxIndex} />
            ))}
          </div>
        )}
        {layout === 'grid' && (
          <div className="w-full flex flex-wrap overflow-scroll h-full justify-around">
            {pokemon.map((poke, index) => (
              <PokemonCard poke={poke} key={poke.id} boxNum={Math.floor(index / 30)} />
            ))}
          </div>
        )}
        {layout === 'list' && (
          <div className="w-full flex flex-col gap-2 px-4 overflow-scroll h-full pt-4">
            {pokemon.map((poke) => (
              <PokemonListItem poke={poke} key={poke.id} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
