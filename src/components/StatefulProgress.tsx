import { caughtNumber } from "@/state/atoms";
import { Progress } from "./ui/progress"
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";


export const StatefuleProgress = ({ numPokemon, className }: { numPokemon: number; className?: string }) => {
    const [caught] = useAtom(caughtNumber);

    const percentCaught = (caught / numPokemon) * 100;

    console.log(percentCaught)

    return (<Progress className={cn("w-full h-8", className)} value={percentCaught} />)
}