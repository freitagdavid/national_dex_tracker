import { Fragment } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const shim = 'bg-black/20 dark:bg-white/25';

/** Mirrors loaded modal body layout so height stays stable while the detail query runs. */
export function PokemonInfoModalBodySkeleton({ pillBg }: { pillBg: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <Skeleton className={cn('h-36 w-36 shrink-0 rounded-2xl', shim)} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Skeleton className={cn('h-6 w-16 rounded-full', shim)} />
            <Skeleton className={cn('h-6 w-20 rounded-full', shim)} />
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
            {Array.from({ length: 10 }, (_, i) => (
              <Fragment key={i}>
                <Skeleton className={cn('h-4 w-24', shim)} />
                <Skeleton className={cn('h-4 w-12 justify-self-end', shim)} />
              </Fragment>
            ))}
          </dl>
        </div>
      </div>

      <div className="space-y-2 rounded-xl px-3 py-3" style={{ backgroundColor: pillBg }}>
        <Skeleton className={cn('h-4 w-28', shim)} />
        <div className="space-y-2">
          <Skeleton className={cn('h-3 w-full', shim)} />
          <Skeleton className={cn('h-3 w-full', shim)} />
          <Skeleton className={cn('h-3 w-[92%]', shim)} />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-14', shim)} />
        <Skeleton className={cn('h-9 w-full max-w-md rounded-md', shim)} />
      </div>

      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-40', shim)} />
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Fragment key={i}>
              <Skeleton className={cn('h-4 w-16', shim)} />
              <Skeleton className={cn('h-4 w-24', shim)} />
            </Fragment>
          ))}
        </dl>
      </div>

      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-24', shim)} />
        <Skeleton className={cn('h-4 w-48 max-w-full', shim)} />
      </div>

      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-24', shim)} />
        <div className="flex flex-wrap gap-2">
          <Skeleton className={cn('h-7 w-20 rounded-full', shim)} />
          <Skeleton className={cn('h-7 w-24 rounded-full', shim)} />
          <Skeleton className={cn('h-7 w-28 rounded-full', shim)} />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-20', shim)} />
        <div className="space-y-2">
          <Skeleton className={cn('h-4 w-44', shim)} />
          <Skeleton className={cn('h-4 w-52 max-w-full', shim)} />
          <Skeleton className={cn('h-4 w-36', shim)} />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-24', shim)} />
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className={cn('h-4 w-28 shrink-0', shim)} />
              <Skeleton className={cn('h-2 min-w-0 flex-1 rounded-full', shim)} />
              <Skeleton className={cn('h-4 w-8 shrink-0', shim)} />
            </div>
          ))}
        </div>
        <Skeleton className={cn('h-3 w-56', shim)} />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className={cn('h-9 w-40 rounded-md', shim)} />
      </div>
    </div>
  );
}
