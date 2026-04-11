import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef } from "react";
import type {
	AllPokemonSpeciesWithSpritesQuery,
	AllRegionsEnglishNamesQuery,
	AllVersionsEnglishNamesQuery,
	CatchableNonDefaultPokemonIdsQuery,
} from "@/gql/operation-types";
import { graphqlRequest } from "./graphqlFetch";
import {
	app,
	CATCHABLE_NON_DEFAULT_POKEMON_QUERY,
	pokemonSpeciesPayloadSignature,
	REGIONS_QUERY,
	SPECIES_QUERY,
	VERSIONS_QUERY,
} from "./store";

export function GraphqlQuerySync({ children }: { children: ReactNode }) {
	const speciesQuery = useQuery({
		queryKey: ["graphql", "pokemonSpecies"],
		queryFn: () =>
			graphqlRequest<AllPokemonSpeciesWithSpritesQuery>(SPECIES_QUERY),
	});

	const versionsQuery = useQuery({
		queryKey: ["graphql", "versionNames"],
		queryFn: () => graphqlRequest<AllVersionsEnglishNamesQuery>(VERSIONS_QUERY),
	});

	const regionsQuery = useQuery({
		queryKey: ["graphql", "regionNames"],
		queryFn: () => graphqlRequest<AllRegionsEnglishNamesQuery>(REGIONS_QUERY),
	});

	const catchableNonDefaultQuery = useQuery({
		queryKey: ["graphql", "catchableNonDefaultPokemon"],
		queryFn: () =>
			graphqlRequest<CatchableNonDefaultPokemonIdsQuery>(
				CATCHABLE_NON_DEFAULT_POKEMON_QUERY,
			),
		staleTime: 24 * 60 * 60 * 1000,
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
		if (
			lastSpeciesSig.current === sig &&
			app.state.query.speciesData.peek() != null
		) {
			return;
		}
		lastSpeciesSig.current = sig;
		app.state.query.speciesData.set(d);
	}, [speciesQuery.data, speciesQuery.isFetching]);

	useEffect(() => {
		const rows = versionsQuery.data?.pokemon_v2_versionname;
		app.state.query.versionRows.set(rows ?? undefined);
	}, [versionsQuery.data?.pokemon_v2_versionname]);

	useEffect(() => {
		const rows = regionsQuery.data?.pokemon_v2_region;
		app.state.query.regionRows.set(rows ?? undefined);
	}, [regionsQuery.data?.pokemon_v2_region]);

	useEffect(() => {
		const rows = catchableNonDefaultQuery.data?.pokemon_v2_pokemon;
		if (rows != null) {
			app.state.query.catchableNonDefaultFormPokemonIds.set(
				rows.map((r) => r.id),
			);
			return;
		}
		if (catchableNonDefaultQuery.isError) {
			app.state.query.catchableNonDefaultFormPokemonIds.set([]);
		}
	}, [
		catchableNonDefaultQuery.data?.pokemon_v2_pokemon,
		catchableNonDefaultQuery.isError,
	]);

	return <>{children}</>;
}
