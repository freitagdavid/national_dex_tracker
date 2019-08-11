import { combineReducers } from "redux";
import { Pokedex } from "pokeapi-js-wrapper";
export const FETCH_POKEMON_START = "FETCH_POKEMON_START";
export const FETCH_POKEMON_SUCCESS = "FETCH_POKEMON_FAILURE";
export const FETCH_POKEMON_FAILURE = "FETCH_POKEMON_FAILURE";
export const SET_NUM_POKEMON = "SET_NUM_POKEMON";
export const SET_POKEMONS = "SET_POKEMONS";
export const TOGGLE_POKEMON = "TOGGLE_POKEMON";

const P = new Pokedex();

const initialState = {
    numPokemon: 0,
    pokemon: [],
    isLoading: true,
    numCaught: 0
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_POKEMON_START:
            return {
                ...state,
                isLoading: true
            };
        case SET_NUM_POKEMON:
            return {
                ...state,
                numPokemon: action.payload
            };
        case SET_POKEMONS:
            return {
                ...state,
                isLoading: false,
                pokemon: action.payload
            };
        case TOGGLE_POKEMON:
            console.log(state.pokemon[action.payload]);
            return {
                ...state,
                pokemon: {
                    ...state.pokemon,
                    [action.payload]: {
                        ...state.pokemon[action.payload],
                        caught: !state.pokemon[action.payload].caught
                    }
                },
                numCaught: state.pokemon[action.payload].caught
                    ? state.numCaught - 1
                    : state.numCaught + 1
            };
        default:
            return state;
    }
};

export const fetchPokemon = () => dispatch => {
    dispatch({ type: FETCH_POKEMON_START });
    P.getPokemonsList()
        .then(res => {
            return P.resource(res.results.map(item => item.url));
        })
        .then(res => {
            return res.filter(item => item.is_default);
        })
        .then(res => {
            dispatch({ type: SET_NUM_POKEMON, payload: res.length });
            return (res = res.map(item => {
                return { ...item, caught: false };
            }));
        })
        .then(res => {
            let pokeObj = {};
            for (let i = 0; i < res.length; i++) {
                pokeObj[i] = res[i];
            }
            dispatch({ type: SET_POKEMONS, payload: pokeObj });
        });
};

export default combineReducers({
    reducer
});
