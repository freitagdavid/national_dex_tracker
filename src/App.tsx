import { useAtom } from 'jotai/react';
import './App.css'
import { boxesAtom, pokemonListQuery } from './state';
import { PokemonCard } from './components/PokemonCard';
import { StatefuleProgress } from './components/StatefulProgress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { Progress } from './components/ui/progress';

function App() {

  const [pokemon] = useAtom(pokemonListQuery);
  const [boxes] = useAtom(boxesAtom);
  console.log(boxes)

  return (
    <>
      <div className="w-screen h-screen">
        <div className="w-full">
          <div className="bg-accent w-full h-16 flex justify-center items-center shadow-md">
            <p className="text-primary">National Dex Tracker</p>
          </div>
          <StatefuleProgress numPokemon={pokemon.data?.pokemon_v2_pokemonspecies.length || 0} fillClassName="bg-green-500" className="rounded-none bg-red-500" />
        </div>

        <div className="w-full flex flex-wrap overflow-scroll h-full justify-around mt-8">
          {boxes.map((box, i) => {
            return (
              <Collapsible className="w-11/12 shadow-md border-border border-solid border-2 mb-8 max-w-304">
                <CollapsibleTrigger className="w-full bg-accent text-primary text-center h-14 pb-0">
                  <div className="h-10 flex w-full justify-center flex-col">Box {i + 1}</div>
                  <div className="h-4 w-full m-0 p-0">
                    <Progress value={60} className="m-0 p-0 rounded-none bg-red-600" fillClassName="bg-green-500" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-wrap justify-evenly">
                  {box.map((poke) => {
                    return (
                      <PokemonCard poke={poke} key={poke.id} />
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>

            )
          })}
        </div>
      </div>
    </>
  )
}

export default App
