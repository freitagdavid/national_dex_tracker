import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import { useGetNumPokemonSpeciesQuery, useGetPokemonSpeciesAllQuery } from '../features/pokedex/pokeApiSlice'

// Use throughout your app instead of plain `useDispatch` and `useSelector`

export const usePokemonSpeciesAll = () => {
    const numSpecies = useGetNumPokemonSpeciesQuery();
    const pokemonSpeciesAll = useGetPokemonSpeciesAllQuery(numSpecies.data)
    return pokemonSpeciesAll.data?.results
}

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()