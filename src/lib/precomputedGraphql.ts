import graphqlCache from "@/generated/precomputed/graphql-cache.json";
import type { PrecomputedGraphqlCacheV1 } from "@/lib/precomputedTypes";

const cache = graphqlCache as PrecomputedGraphqlCacheV1;

function encountersCacheKey(pokemonIds: number[], versionId: number): string {
	const sorted = [...pokemonIds].sort((a, b) => a - b);
	return `${versionId}:${sorted.join(",")}`;
}

/**
 * Returns cached GraphQL `data` when `graphql-cache.json` has been filled by
 * `bun run precompute:data`. Otherwise `undefined` (caller should use the network).
 */
export function tryGetPrecomputedGraphql<TData>(
	query: string,
	variables?: Record<string, unknown>,
): TData | undefined {
	if (cache.version !== 1) return undefined;

	if (query.includes("allPokemonSpeciesWithSprites") && cache.species != null) {
		return cache.species as TData;
	}
	if (query.includes("allVersionsEnglishNames") && cache.versions != null) {
		return cache.versions as TData;
	}
	if (query.includes("allRegionsEnglishNames") && cache.regions != null) {
		return cache.regions as TData;
	}
	if (query.includes("CatchableNonDefaultPokemonIds") && cache.catchable != null) {
		return cache.catchable as TData;
	}

	if (query.includes("PokemonSpeciesDetail")) {
		const id = variables?.id;
		if (typeof id !== "number") return undefined;
		const row = cache.speciesDetail[String(id)];
		return row != null ? (row as TData) : undefined;
	}

	if (query.includes("PokemonSpeciesEncounters")) {
		const pokemonIds = variables?.pokemonIds;
		const versionId = variables?.versionId;
		if (!Array.isArray(pokemonIds) || typeof versionId !== "number") return undefined;
		const ids = pokemonIds.filter((x): x is number => typeof x === "number");
		const key = encountersCacheKey(ids, versionId);
		const row = cache.encounters[key];
		return row != null ? (row as TData) : undefined;
	}

	if (query.includes("PokemonSpeciesMoves")) {
		const pokemonId = variables?.pokemonId;
		const versionGroupId = variables?.versionGroupId;
		if (typeof pokemonId !== "number" || typeof versionGroupId !== "number") {
			return undefined;
		}
		const key = `${pokemonId}:${versionGroupId}`;
		const row = cache.moves[key];
		return row != null ? (row as TData) : undefined;
	}

	return undefined;
}
