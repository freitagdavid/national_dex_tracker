import { Accordion, AccordionItem, Progress } from "@nextui-org/react";
import { useAllPokemonSpeciesWithSpritesQuery } from "../features/pokemon/getPokemon.generated";
import { chunk } from "lodash";
import { PokemonCard } from "../components/PokemonCard";
import { useAppSelector } from "../app/hooks";
import { useGetFilteredPokemonQuery } from "@/features/pokemon/GetFilteredPokemon.generated";

export default function BoxLayout() {
    // const { data, isLoading, isFetching } = useAllPokemonSpeciesWithSpritesQuery();
    const caughtTotal = useAppSelector((state) => state.caughtTotal);
    const { data: pokemon, isLoading: pokemonLoading, isFetching: pokemonIsFetching } = useGetFilteredPokemonQuery();

    if (pokemonLoading) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center">
                <div>Loading</div>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between px-10 w-screen h-full mt-8 pb-8 bg-background debug">

            {

            }

            {!pokemonLoading && pokemon && <div className="w-full flex flex-wrap overflow-scroll">
                <Accordion variant='splitted' selectionMode="multiple" className="flex flex-row flex-wrap border-red-500 border-2 border-solid">
                    {chunk(pokemon.pokemon_v2_pokemonspecies, 30).map((box, i) => {
                        return (
                            <AccordionItem key={i} title={`Box ${i + 1}`} className="max-w-304 w-11/12">
                                <div className="w-full flex flex-wrap justify-evenly">
                                    {box.map((poke) => {
                                        return <PokemonCard poke={poke} key={poke.id} boxNum={i} />
                                    })}
                                    <Progress value={50} className="m-0 p-0 rounded-none" color="success" />
                                </div>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </div>}
        </main>
    )
};