import graphqlCache from "@/generated/precomputed/graphql-cache.json";
import type { PrecomputedGraphqlCache, PrecomputedGraphqlCacheV2 } from "@/lib/precomputedTypes";

const cache = graphqlCache as PrecomputedGraphqlCache;
const decodeMemo = new Map<number, unknown>();

function encountersCacheKey(pokemonIds: number[], versionId: number): string {
	const sorted = [...pokemonIds].sort((a, b) => a - b);
	return `${versionId}:${sorted.join(",")}`;
}

function decodeNode(cacheV2: PrecomputedGraphqlCacheV2, id: number): unknown {
	const cached = decodeMemo.get(id);
	if (cached !== undefined) return cached;
	const node = cacheV2.nodes[id];
	if (node === undefined) return undefined;
	if (node === null || typeof node !== "object") {
		decodeMemo.set(id, node);
		return node;
	}
	if (node.t === "a") {
		const arr = node.v.map((childId) => decodeNode(cacheV2, childId));
		decodeMemo.set(id, arr);
		return arr;
	}
	const obj: Record<string, unknown> = {};
	decodeMemo.set(id, obj);
	for (const [k, childId] of Object.entries(node.v)) {
		obj[k] = decodeNode(cacheV2, childId);
	}
	return obj;
}

function resolvePrecomputedRow(
	key: string,
	fromV1: Record<string, unknown>,
	fromV2: Record<string, number>,
): unknown {
	if (cache.version === 1) return fromV1[key];
	const id = fromV2[key];
	if (id === undefined) return undefined;
	return decodeNode(cache, id);
}

function inflateCompactMoves(
	compactRows: [number, number | null, number | null, number | null, string | null, string | null][],
): unknown {
	return {
		pokemon_v2_pokemonmove: compactRows.map(
			([id, level, moveLearnMethodId, moveId, moveName, moveLearnMethodName]) => ({
				id,
				level,
				move_learn_method_id: moveLearnMethodId,
				pokemon_v2_move:
					moveId == null && moveName == null
						? null
						: {
								id: moveId ?? 0,
								pokemon_v2_movenames: moveName == null ? [] : [{ name: moveName }],
							},
				pokemon_v2_movelearnmethod:
					moveLearnMethodName == null ? null : { name: moveLearnMethodName },
			}),
		),
	};
}

/**
 * Returns cached GraphQL `data` when `graphql-cache.json` has been filled by
 * `bun run precompute:data`. Otherwise `undefined` (caller should use the network).
 */
export function tryGetPrecomputedGraphql<TData>(
	query: string,
	variables?: Record<string, unknown>,
): TData | undefined {
	if (cache.version !== 1 && cache.version !== 2) return undefined;

	if (query.includes("allPokemonSpeciesWithSprites")) {
		const row =
			cache.version === 1
				? cache.species
				: cache.roots.species == null
					? null
					: decodeNode(cache, cache.roots.species);
		return row != null ? (row as TData) : undefined;
	}
	if (query.includes("allVersionsEnglishNames")) {
		const row =
			cache.version === 1
				? cache.versions
				: cache.roots.versions == null
					? null
					: decodeNode(cache, cache.roots.versions);
		return row != null ? (row as TData) : undefined;
	}
	if (query.includes("allRegionsEnglishNames")) {
		const row =
			cache.version === 1
				? cache.regions
				: cache.roots.regions == null
					? null
					: decodeNode(cache, cache.roots.regions);
		return row != null ? (row as TData) : undefined;
	}
	if (query.includes("CatchableNonDefaultPokemonIds")) {
		const row =
			cache.version === 1
				? cache.catchable
				: cache.roots.catchable == null
					? null
					: decodeNode(cache, cache.roots.catchable);
		return row != null ? (row as TData) : undefined;
	}

	if (query.includes("PokemonSpeciesDetail")) {
		const id = variables?.id;
		if (typeof id !== "number") return undefined;
		const row = resolvePrecomputedRow(
			String(id),
			cache.version === 1 ? cache.speciesDetail : {},
			cache.version === 2 ? cache.roots.speciesDetail : {},
		);
		return row != null ? (row as TData) : undefined;
	}

	if (query.includes("PokemonSpeciesEncounters")) {
		const pokemonIds = variables?.pokemonIds;
		const versionId = variables?.versionId;
		if (!Array.isArray(pokemonIds) || typeof versionId !== "number") return undefined;
		const ids = pokemonIds.filter((x): x is number => typeof x === "number");
		const key = encountersCacheKey(ids, versionId);
		const row = resolvePrecomputedRow(
			key,
			cache.version === 1 ? cache.encounters : {},
			cache.version === 2 ? cache.roots.encounters : {},
		);
		return row != null ? (row as TData) : undefined;
	}

	if (query.includes("PokemonSpeciesMoves")) {
		const pokemonId = variables?.pokemonId;
		const versionGroupId = variables?.versionGroupId;
		if (typeof pokemonId !== "number" || typeof versionGroupId !== "number") {
			return undefined;
		}
		const key = `${pokemonId}:${versionGroupId}`;
		if (cache.version === 2 && cache.movesCompact?.[key]) {
			return inflateCompactMoves(cache.movesCompact[key]!) as TData;
		}
		const row = resolvePrecomputedRow(
			key,
			cache.version === 1 ? cache.moves : {},
			cache.version === 2 ? cache.roots.moves : {},
		);
		return row != null ? (row as TData) : undefined;
	}

	return undefined;
}
