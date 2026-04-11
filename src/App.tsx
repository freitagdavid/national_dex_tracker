import { useSelector } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import './App.css';
import { app, SPECIES_QUERY } from '@/state';
import { graphqlRequest } from '@/state/graphqlFetch';
import type { AllPokemonSpeciesWithSpritesQuery } from '@/gql/operation-types';
import { StatefuleProgress } from './components/StatefulProgress';
import { Box } from './components/Box';
import { AppBar } from './components/MenuBar';
import { PokemonCard } from './components/PokemonCard';
import { PokemonListItem } from './components/PokemonListItem';
import { PokemonInfoModal } from './components/PokemonInfo/PokemonInfoModal';
import { AppLoadingSkeleton } from './components/AppLoadingSkeleton';
import { Card, CardHeader, CardTitle } from './components/ui/card';
import { Separator } from './components/ui/separator';

function App() {
  const pokemon = useSelector(() => app.pokemonList.get() ?? []);
  const boxes = useSelector(() => app.boxes.get() ?? []);
  const layout = useSelector(() => app.state.ui.listLayout.get());

  const speciesBootstrap = useQuery({
    queryKey: ['graphql', 'pokemonSpecies'],
    queryFn: () => graphqlRequest<AllPokemonSpeciesWithSpritesQuery>(SPECIES_QUERY),
  });

  const showMainSkeleton =
    !speciesBootstrap.isError &&
    !speciesBootstrap.data &&
    (speciesBootstrap.isPending || speciesBootstrap.isFetching);

  return (
    <>
      <PokemonInfoModal />
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <div className="w-full shrink-0">
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
        <div className="min-h-0 flex-1 overflow-y-auto">
        {speciesBootstrap.isError && !speciesBootstrap.data ? (
          <div className="flex min-h-full w-full items-center justify-center p-6 text-center text-destructive text-sm">
            Could not load Pokémon data.
            {speciesBootstrap.error instanceof Error ? ` ${speciesBootstrap.error.message}` : null}
          </div>
        ) : showMainSkeleton ? (
          <AppLoadingSkeleton layout={layout} />
        ) : (
          <>
            {layout === 'box' && (
              <div className="flex w-full flex-wrap justify-around px-2 py-2">
                {boxes.map((box, boxIndex) => (
                  <Box box={box} boxNum={boxIndex} key={boxIndex} />
                ))}
              </div>
            )}
            {layout === 'grid' && (
              <div className="flex w-full flex-wrap justify-around px-2 py-2">
                {pokemon.map((poke, index) => (
                  <PokemonCard poke={poke} key={poke.id} boxNum={Math.floor(index / 30)} />
                ))}
              </div>
            )}
            {layout === 'list' && (
              <div className="flex w-full flex-col gap-3 px-3 py-4 sm:px-4">
                {pokemon.map((poke) => (
                  <PokemonListItem poke={poke} key={poke.id} />
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
}

export default App;
