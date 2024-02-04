import { Pokemon_V2_Pokemonspecies } from "@/gql/graphql";
import { PokemonCard } from "./PokemonCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Progress } from "./ui/progress";
import { useAtom } from "jotai";
import { boxCaughtAtom } from "@/state";
import { useState } from "react";

export const Box = ({ box, boxNum }: { box: Pokemon_V2_Pokemonspecies[]; boxNum: number }) => {

  const [caught] = useAtom(boxCaughtAtom(boxNum));
  const caughtPercent = (caught / 30) * 100;
  const [isOpen, setIsOpen] = useState(true);


  return (
    <Collapsible className="w-11/12 shadow-md border-border border-solid border-2 mb-8 max-w-304" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full bg-accent text-primary text-center h-14 pb-0">
        <div className="h-10 flex w-full justify-center flex-col">Box {boxNum + 1}</div>
        <div className="h-4 w-full m-0 p-0">
          <Progress value={caughtPercent} className="m-0 p-0 rounded-none bg-red-600" fillClassName="bg-green-500" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-wrap justify-evenly">
        {box.map((poke) => {
          return (
            <PokemonCard poke={poke} key={poke.id} boxNum={boxNum} />
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
};