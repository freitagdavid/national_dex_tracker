import { useAtom } from 'jotai/react';
import './App.css'
import { pokemonListQuery } from './state';
import { PokemonCard } from './components/PokemonCard';

function App() {

  const [pokemon] = useAtom(pokemonListQuery);

  return (
    <>
      <div className="w-full h-full">
        <div className="bg-accent w-full h-16 flex justify-center items-center shadow-md">
          <p className="text-primary">National Dex Tracker</p>
        </div>
      </div>

      <div className="w-full flex flex-wrap">

        {pokemon.data?.pokemon_v2_pokemonspecies.map((poke) => {
          return (
            <PokemonCard poke={poke} key={poke.id} />
          )
        })}

      </div>
    </>
  )
}

export default App
