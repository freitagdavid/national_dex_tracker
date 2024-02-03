import { caughtNumber } from "@/state/atoms";
import { Progress } from "./ui/progress"
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";


export const StatefuleProgress = ({ numPokemon, className, fillClassName }: { numPokemon: number; className?: string; fillClassName: ClassValue }) => {
    const [caught] = useAtom(caughtNumber);

    const percentCaught = (caught / numPokemon) * 100;

    console.log(percentCaught)

    return (<Progress className={cn("w-full h-8", className)} value={percentCaught} fillClassName={fillClassName} />)
}