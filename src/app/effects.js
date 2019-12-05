import page from 'page'
import { nationalDex } from "../data/nationalDex"
import { Pokedex } from "pokeapi-js-wrapper"

const P = new Pokedex()

export const storage = {
    savePokemon(pokemon) {
        localStorage.setItem('pokemon', JSON.stringify(pokemon));
    },
    loadPokemon() {
        P.getPokemonsList().then(list => console.log(list))
        const json = localStorage.getItem("pokemon");
        if (json === null) {
            const pokeList = nationalDex.map(item => item = { ...item, caught: false });
            return pokeList
        } else {
            return JSON.parse(json);
        }
    }
}

export const pokeApi = {
    getList() {
        return P.getPokemonsList()
    }
}