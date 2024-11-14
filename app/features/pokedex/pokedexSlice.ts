import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type caughtEntry = {
    id: number;
    name: string;
    caught: boolean;
}

export interface PokedexState {
    caught: caughtEntry[];
}

const initialState: PokedexState = {
    caught: []
}


export const pokedexSlice = createSlice({
    name: 'pokedex',
    initialState,
    reducers: {
        toggleCaughtStatus: (state, action: PayloadAction<number>) => {
            state.caught.map((item, index) => {
                if (item.id === action.payload) {
                    state.caught[index].caught = !state.caught[index].caught;
                }
            })
    }
});