import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { GraphqlQuerySync } from './GraphqlQuerySync';
import { ReactNode } from 'react';

export const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GraphqlQuerySync>{children}</GraphqlQuerySync>
    </QueryClientProvider>
  );
};
