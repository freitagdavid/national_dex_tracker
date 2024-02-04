import { Pokemon_V2_Pokemonspecies } from "@/gql/graphql";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { caughtStatus } from "@/state";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

export const SkeletonCard = () => {
    return (
        < Card className="aspect-square flex flex-col align-middle justify-between w-44 mt-3">
            <CardHeader className='py-2 border-b-[1px] border-border border-solid'>
                <Skeleton className='w-full text-center h-6' />
            </CardHeader>
            <CardContent className='px-0 pb-0 flex justify-center'>
                <Skeleton className="w-[100px] h-[100px]" />
            </CardContent>
            <CardFooter className='w-full flex justify-center pb-0 px-0'>
                <Skeleton className='w-full' />
            </CardFooter>
        </Card >
    )
}

export const PokemonCard = ({ poke, boxNum }: { poke: Pokemon_V2_Pokemonspecies, key: number, boxNum: number }) => {
    const [caught, setCaught] = useAtom(caughtStatus(poke.id));

    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    }

    const handleCaught = () => {
        setCaught({ caught: !caught, boxNum: boxNum })
    }

    return (
        <Card className="aspect-square flex flex-col align-middle justify-between w-44 mt-3" onClick={handleCaught}>
            <CardHeader className='py-2 border-b-[1px] border-border border-solid'>
                <CardTitle className='w-full text-center'>{poke.name.charAt(0).toUpperCase()
                    + poke.name.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent className='px-0 pb-0 flex justify-center'>
                <LazyLoadImage
                    src={poke.pokemon_v2_pokemons[0].pokemon_v2_pokemonsprites[0].sprites.front_default}
                    alt={poke.name}
                    className="w-[100px] h-[100px]"
                    width={100}
                    height={100}
                    onLoad={handleLoad}
                    placeholder={<Skeleton className="w-[100px] h-[100px]" />}
                />
            </CardContent>
            <CardFooter className='w-full flex justify-center pb-0 px-0'>
                <Button className={cn('w-full', caught ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700')}>
                    {caught ? "Caught" : "Uncaught"}
                </Button>
            </CardFooter>
        </Card>
    )
};