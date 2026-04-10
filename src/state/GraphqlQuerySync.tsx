import type { AllPokemonSpeciesWithSpritesQuery, AllVersionsEnglishNamesQuery } from '@/gql/graphql';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, type ReactNode } from 'react';
import { app, pokemonSpeciesPayloadSignature, SPECIES_QUERY, VERSIONS_QUERY } from './store';
import { graphqlRequest } from './graphqlFetch';

export function GraphqlQuerySync({ children }: { children: ReactNode }) {
  const speciesQuery = useQuery({
    queryKey: ['graphql', 'pokemonSpecies'],
    queryFn: () => graphqlRequest<AllPokemonSpeciesWithSpritesQuery>(SPECIES_QUERY),
  });

  const versionsQuery = useQuery({
    queryKey: ['graphql', 'versionNames'],
    queryFn: () => graphqlRequest<AllVersionsEnglishNamesQuery>(VERSIONS_QUERY),
  });

  const lastSpeciesSig = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (speciesQuery.isFetching && speciesQuery.data === undefined) {
      return;
    }

    const d = speciesQuery.data;
    if (d == null) {
      lastSpeciesSig.current = undefined;
      app.state.query.speciesData.set(undefined);
      return;
    }

    const rows = d.pokemon_v2_pokemonspecies;
    if (rows == null) {
      lastSpeciesSig.current = undefined;
      app.state.query.speciesData.set(undefined);
      return;
    }

    const sig = pokemonSpeciesPayloadSignature(rows);
    if (lastSpeciesSig.current === sig && app.state.query.speciesData.peek() != null) {
      return;
    }
    lastSpeciesSig.current = sig;
    app.state.query.speciesData.set(d);
  }, [speciesQuery.data, speciesQuery.isFetching]);

  useEffect(() => {
    const rows = versionsQuery.data?.pokemon_v2_versionname;
    app.state.query.versionRows.set(rows ?? undefined);
  }, [versionsQuery.data?.pokemon_v2_versionname]);

  return <>{children}</>;
}
