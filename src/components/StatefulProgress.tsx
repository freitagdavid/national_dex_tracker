import { app } from '@/state';
import { Progress } from './ui/progress';
import { useSelector } from '@legendapp/state/react';
import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';

export const StatefuleProgress = ({
  numPokemon,
  className,
  fillClassName,
}: {
  numPokemon: number;
  className?: string;
  fillClassName: ClassValue;
}) => {
  const caught = useSelector(() => app.caughtCount.get());
  const percentCaught = numPokemon > 0 ? (caught / numPokemon) * 100 : 0;

  return (
    <Progress
      className={cn('w-full h-8', className)}
      value={percentCaught}
      indicatorClassName={fillClassName}
    />
  );
};
