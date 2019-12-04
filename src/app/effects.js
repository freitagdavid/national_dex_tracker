import page from 'page'
import { nationalDex } from "../data/nationalDex"

export const storage = {
    savePokemon(pokemon) {
        localStorage.setItem('pokemon', JSON.stringify(pokemon));
    },
    loadPokemon() {
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

}