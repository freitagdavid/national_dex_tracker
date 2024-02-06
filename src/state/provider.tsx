import { Provider as JotaiProvider } from 'jotai';
import { Provider as UrqlProvider } from 'urql';
import { urqlClient } from './client';
import { clientAtom } from 'jotai-urql';
import { useHydrateAtoms } from 'jotai/utils';
import { ReactNode, Suspense } from 'react';
import { DevTools } from 'jotai-devtools';

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
    useHydrateAtoms([[clientAtom, urqlClient]])
    return children
}

export const Provider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
    return (
        < UrqlProvider value={urqlClient} >
            <JotaiProvider>
                <HydrateAtoms>
                    <DevTools />
                    <Suspense fallback={<div>Loading...</div>}>
                        {children}
                    </Suspense>
                </HydrateAtoms>
            </JotaiProvider>
        </UrqlProvider >
    )
}