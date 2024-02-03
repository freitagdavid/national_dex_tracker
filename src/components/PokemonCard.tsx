import { Pokemon_V2_Pokemonspecies } from "@/gql/graphql";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { caughtStatus } from "@/state";
import { useAtom } from "jotai";

export const PokemonCard = ({ poke }: { poke: Pokemon_V2_Pokemonspecies, key: number }) => {
    const [caught, setCaught] = useAtom(caughtStatus(poke.id));

    const handleCaught = () => {
        setCaught(!caught)
    }

    return (
        <Card className="w-1/6 aspect-square flex flex-col align-middle justify-between">
            <CardHeader className='pb-0'>
                <CardTitle className='w-full text-center'>{poke.name.charAt(0).toUpperCase()
                    + poke.name.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent className='px-0 pb-0'>
                <img src={poke.pokemon_v2_pokemons[0].pokemon_v2_pokemonsprites[0].sprites.front_default} alt={poke.name} className="w-full aspect-square" />
            </CardContent>
            <CardFooter className='w-full flex justify-center pb-0 px-0'>
                <Button className='w-full' onClick={handleCaught}>
                    {caught ? "Caught" : "Uncaught"}
                </Button>
            </CardFooter>
        </Card>
    )
};