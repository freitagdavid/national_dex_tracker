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
    pokemonFilter: {
        spritesPath: string;
        pokemonV2PokemonspeciesWhere: {
            generation_id?: {
                _eq?: number;
            };
            pokemon_v2_generation?: {
                pokemon_v2_versiongroups?: {
                    id?: {
                        _eq?: number;
                    };
                };
            };
        };
    };
}

const initialState: CaughtState = {
    caught: {},
    caughtTotal: 0,
    pokemon: [],
    generationId: null,
    versionGroupId: null,
    typeId: null,
    pokemonFilter: {
        pokemonV2PokemonspeciesWhere: {},
        spritesPath: "other.official-artwork",
    },
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
            state.pokemonFilter = {
                ...state.pokemonFilter,
                pokemonV2PokemonspeciesWhere: {
                    ...state.pokemonFilter?.pokemonV2PokemonspeciesWhere,
                    generation_id: {
                        _eq: action.payload,
                    },
                },
            };
        },
        setVersionGroupId(state, action: PayloadAction<number>) {
            state.pokemonFilter = {
                ...state.pokemonFilter,
                pokemonV2PokemonspeciesWhere: {
                    ...state.pokemonFilter.pokemonV2PokemonspeciesWhere,
                    pokemon_v2_generation: {
                        pokemon_v2_versiongroups: {
                            id: { _eq: action.payload },
                        },
                    },
                },
            };
        },
        setTypeId(state, action: PayloadAction<number>) {
            state.typeId = action.payload;
        },
    },
});

export const { toggle, setGenerationId, setVersionGroupId, setTypeId } =
    caughtSlice.actions;

export default caughtSlice.reducer;
