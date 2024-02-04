import { useAtom } from 'jotai/react';
import './App.css'
import { boxesAtom, pokemonListQuery } from './state';
import { StatefuleProgress } from './components/StatefulProgress';
import { Box } from './components/Box';

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
              <Box box={box} boxNum={i} key={i} />

            )
          })}
        </div>
      </div>
    </>
  )
}

export default App
