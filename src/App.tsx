import { useSelector } from '@legendapp/state/react';
import './App.css';
import { app } from '@/state';
import { StatefuleProgress } from './components/StatefulProgress';
import { Box } from './components/Box';
import { AppBar } from './components/MenuBar';
import { PokemonCard } from './components/PokemonCard';
import { PokemonListItem } from './components/PokemonListItem';
import { Card, CardHeader, CardTitle } from './components/ui/card';
import { Separator } from './components/ui/separator';

function App() {
  const pokemon = useSelector(() => app.pokemonList.get() ?? []);
  const boxes = useSelector(() => app.boxes.get() ?? []);
  const layout = useSelector(() => app.state.ui.listLayout.get());

  return (
    <>
      <div className="w-screen h-screen">
        <div className="w-full">
          <Card className="w-full rounded-none border-x-0 border-t-0 shadow-md">
            <CardHeader className="bg-accent flex flex-col items-center justify-center space-y-0 py-4">
              <CardTitle className="text-center text-base font-medium text-primary sm:text-lg">
                National Dex Tracker
              </CardTitle>
            </CardHeader>
          </Card>
          <Separator className="rounded-none" />
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
          <div className="flex h-full w-full flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-4">
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
