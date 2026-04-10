import { PokemonCard } from './PokemonCard';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Progress } from './ui/progress';
import { useSelector } from '@legendapp/state/react';
import { app, Pokemon } from '@/state';
import { useState } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export const Box = ({ box, boxNum }: { box: Pokemon[]; boxNum: number }) => {
  const caught = useSelector(() => app.state.ui.boxCaught[boxNum].get() ?? 0);
  const caughtPercent = (caught / 30) * 100;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="mt-8 mb-8 w-11/12 max-w-304 overflow-hidden p-0 shadow-md">
      <Collapsible
        className="w-full border-0 shadow-none"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsibleTrigger className="h-14 w-full bg-accent pb-0 text-center text-primary">
          <div className="relative flex">
            <div className="flex h-10 w-full flex-col justify-center">Box {boxNum + 1}</div>
            <div className="absolute right-0 flex h-10 w-10 items-center justify-center">
              <FaChevronUp className={cn('h-4 w-4 transition-all', isOpen ? '' : 'rotate-180')} />
            </div>
          </div>
          <div className="m-0 h-4 w-full p-0">
            <Progress
              value={caughtPercent}
              className="m-0 rounded-none bg-red-600 p-0"
              indicatorClassName="bg-green-500"
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-wrap justify-evenly">
          {box.map((poke) => (
            <PokemonCard poke={poke} key={poke.id} boxNum={boxNum} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
