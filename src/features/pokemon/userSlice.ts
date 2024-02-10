import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Pokemon_V2_Pokemonspecies } from "../../app/services/types.generated";

interface CaughtState {
    caught: {
        [id: number]: boolean;
    };
    caughtTotal: number;
    pokemon: Pokemon_V2_Pokemonspecies[] | null[];
    generationId: number | null;
    versionGroupId: number | null;
    typeId: number | null;
}

const initialState: CaughtState = {
    caught: {},
    caughtTotal: 0,
    pokemon: [],
    generationId: null,
    versionGroupId: null,
    typeId: null,
};

const caughtSlice = createSlice({
    name: "caught",
    initialState,
    reducers: {
        toggle(state, action: PayloadAction<number>) {
            state.caught[action.payload] = !state.caught[action.payload];
        },
        increment(state) {
            state.caughtTotal++;
        },
        decrement(state) {
            state.caughtTotal--;
        },
        setGenerationId(state, action: PayloadAction<number>) {
            state.generationId = action.payload;
        },
        setVersionGroupId(state, action: PayloadAction<number>) {
            state.versionGroupId = action.payload;
        },
        setTypeId(state, action: PayloadAction<number>) {
            state.typeId = action.payload;
        },
    },
});

export const { toggle } = caughtSlice.actions;

export default caughtSlice.reducer;
