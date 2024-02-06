import { useAtom } from 'jotai/react';
import './App.css'
import { boxesAtom, listTypeAtom, pokemonAtomsAtom } from './state';
import { StatefuleProgress } from './components/StatefulProgress';
import { Box } from './components/Box';
import { AppBar } from './components/MenuBar';
import { PokemonListItem } from './components/PokemonListItem';

function App() {

  const [pokemon] = useAtom(pokemonAtomsAtom);
  const [boxes] = useAtom(boxesAtom);
  const [layout] = useAtom(listTypeAtom);

  return (
    <>
      <div className="w-screen h-screen">
        <div className="w-full">
          <div className="bg-accent w-full h-16 flex justify-center items-center shadow-md">
            <p className="text-primary">National Dex Tracker</p>
          </div>
          <StatefuleProgress numPokemon={pokemon.length || 0} fillClassName="bg-green-500" className="rounded-none bg-red-500" />
          <AppBar />
        </div>
        {layout === 'box' && (
          <div className="w-full flex flex-wrap overflow-scroll h-full justify-around">
            {boxes.map((box, i) => {
              return (
                <Box box={box} boxNum={i} key={i} />
              )
            })}
          </div>
        )}
        {layout === 'list' && (
          <div className="w-full flex flex-col gap-2 px-4 overflow-scroll h-full pt-4">
            {pokemon.map((poke, i) => {
              return (
                <PokemonListItem poke={poke} key={i} />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default App
