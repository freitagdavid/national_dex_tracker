import { Pokemon_V2_Pokemonspecies } from "@/gql/graphql";
import { Atom, useAtom } from "jotai";
import { Checkbox } from "./ui/checkbox";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useEffect, useState } from "react";
import { prominent } from 'color.js'
import { Pokemon } from "@/state";

const useColor = (img) => {
    const [palette, setPalette] = useState([]);

    useEffect(() => {
        const getColors = async () => {
            const palette = await prominent(img);
            setPalette(palette);
        };
        getColors();
    }, [img])
    return palette;
}

export const PokemonListItem = ({ poke }: { poke: Atom<Pokemon>; key: number }) => {
    const [pokemon] = useAtom(poke);
    const [caught, setCaught] = useAtom(pokemon.caught);
    // const colorPalette = useColor(pokemon.sprites.front_default);
    const [palette, setPalette] = useState([]);

    useEffect(() => {
        prominent(pokemon.sprites.front_default).then((palette) => { setPalette(palette) })
    }, [pokemon])

    const handleCaught = () => {
        setCaught({ caught: !caught })
    }

    return (
        <div className="pl-5 rounded-lg flex shadow-md" style={{ backgroundColor: `rgb(${palette[2]})` }}>
            <div className="w-full flex flex-col justify-between py-4">
                <div className="flex w-full justify-between items-center">
                    <div className="flex gap-2">
                        <p className="text-darkTransparent text-xl">{`#${pokemon.id.toString().padStart(3, '0')}`}</p>
                        <p className="text-darkTransparent text-xl">{pokemon.name.charAt(0).toUpperCase()
                            + pokemon.name.slice(1)}</p>
                    </div>
                    <div className="pr-4 flex justify-center">
                        <Checkbox className="rounded-[100%] background-darkTransparent" checked={caught} onClick={handleCaught} />
                    </div>
                </div>
                <div className="flex gap-4 items-center w-full">
                    {pokemon.types.map((type: string) => {
                        return (
                            <div className="border-darkTransparent border border-solid rounded-3xl flex justify-center w-32" key={type}>
                                <p className="text-darkTransparent text-lg text">{type.toUpperCase()}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex justify-end pr-2 w-40 bg-lightTransparent rounded-l-[100%]">
                <LazyLoadImage
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    width={100}
                    height={100}
                />
            </div>
        </div>
    )
};