import { useGlobal, useEffect } from "reactn";
import { Pokedex } from "pokeapi-js-wrapper";
const P = new Pokedex();

export const useToggleCaught = id => {
    const [pokemon, setPokemon] = useGlobal(`pokemon`);
    const toggle = () => {
        setPokemon(prevState => {
            return [
                prevState.map((item, i) => {
                    if (i == id) {
                        return { ...item, caught: !item.caught };
                    }
                    return item;
                })
            ];
        });
    };

    return toggle;
};
