import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggle } from "../features/pokemon/userSlice";
import { Card, Image, CardFooter, Button } from "@nextui-org/react";
import { cn } from "../lib/utils";
import { decrement, increment } from "../features/pokemon/caughtTotalSlice";
import { Pokemon_V2_Pokemonspecies } from "@/app/services/types.generated"

export const PokemonCard = ({ poke, boxNum }: { poke: Pokemon_V2_Pokemonspecies, boxNum: number }) => {
    const caught = useAppSelector((state) => state.caught.caught[poke.id]);
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(toggle(poke.id));
        caught ? dispatch(decrement()) : dispatch(increment());
    };

    return (
        // <Card className="aspect-square flex flex-col align-middle justify-between w-44 mt-3" onClick={handleCaught}></Card>
        <Card isFooterBlurred radius="lg" className="border-none">
            <Image alt={poke.name} className="object-cover" height={180} width={180} src={poke.pokemon_v2_pokemons[0].pokemon_v2_pokemonsprites[0].sprites.front_default} />
            <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden p-0 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                <Button variant="flat" color={caught ? "success" : "danger"} radius="lg" size="sm" className={cn("w-full")} onClick={handleClick}>
                    {caught ? "Caught" : "Uncaught"}
                </Button>
            </CardFooter>
        </Card>
    )
};