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

// export const usePokemonList = () => {
//     const [numPokemon, setNumPokemon] = useGlobal("numPokemon");
//     const [pokemon, setPokemon] = useGlobal("pokemon");
//     const [isLoading, setIsloading] = useGlobal("isLoading");

//     useEffect(() => {
//         if (isLoading) {
//             P.getPokemonsList()
//                 .then(res => {
//                     return Promise.all(
//                         res.results.map(item => P.resource(item.url))
//                     );
//                 })
//                 .then(res => {
//                     return res.filter(item => item.is_default);
//                 })
//                 .then(res => {
//                     console.log(res.length);
//                     setNumPokemon(res.length);
//                     return (res = res.map(item => {
//                         return { ...item, caught: false };
//                     }));
//                 })
//                 .then(res => {
//                     setPokemon(res);
//                     setIsloading(false);
//                 });
//         }
//     }, []);

//     return [{ numPokemon, pokemon }, isLoading];
// };
