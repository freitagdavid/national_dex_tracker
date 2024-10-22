import {createSlice} from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { selectGetPokemonSpeciesAllQuery } from './pokeApiSlice';

export interface ListState {
    caughtStatus: Map<number, boolean>;
}

const initialState: ListState = {
    caughtStatus: new Map(),
}

export const listSlice = createSlice({
    name: 'list',
    initialState,
    reducers: {
        toggleCaught: () => {},
    }
})

export const selectNumberCaught = (state: RootState) => {
    return state.pokemonList.caughtStatus.values().reduce((acc: number, item: boolean) => item ? acc + 1 : acc, 0);
}

export const selectPercentCaught = (state: RootState) => {
    const numCaught = selectNumberCaught(state);
}

export const selectNumBoxes = (state: RootState) => {
    // const numAvailable = selectNumberAvailable(state);
    // console.log(numAvailable)
    // return (numAvailable || 0) % 30;
}

export const {toggleCaught} = listSlice.actions;

export default listSlice.reducer;