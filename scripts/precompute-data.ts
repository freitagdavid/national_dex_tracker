/**
 * Fills `src/generated/precomputed/graphql-cache.json` and `sprite-card-themes.json`.
 *
 * **Hard cap:** at most `--max-calls-per-hour` outbound HTTP requests (GraphQL + sprites
 * combined) in any rolling 60-minute window, with at least `3600 / max` seconds between
 * consecutive request starts so we never burst 200 calls at once.
 *
 * GraphQL and sprite fetches can run with configurable concurrency; optional extra pauses
 * after each response are configurable.
 *
 * Usage:
 *   bun run scripts/precompute-data.ts
 *   bun run scripts/precompute-data.ts --quick
 *   bun run scripts/precompute-data.ts --graphql-only
 *   bun run scripts/precompute-data.ts --colors-only
 *
 * Options:
 *   --max-calls-per-hour <n> Combined HTTP cap (default 200)
 *   --delay-ms <n>           Set both GraphQL and sprite post-response delays (ms)
 *   --graphql-delay-ms <n>   Extra pause after each GraphQL response (default 0)
 *   --sprite-delay-ms <n>    Extra pause after each sprite fetch (default 0)
 *   --graphql-url <url>      Override GraphQL endpoint (localhost/127.0.0.1 only)
 *   --concurrency <n>        Set both GraphQL and sprite worker counts (default 1)
 *   --graphql-concurrency <n> GraphQL worker count (default 1)
 *   --sprite-concurrency <n> Sprite worker count (default 1)
 *   --save-every <n>         Persist checkpoint every N completed items (default 100)
 *   --no-wait                Disable outbound throttling + post-request delays
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
	CATCHABLE_NON_DEFAULT_POKEMON_QUERY,
	POKEMON_SPECIES_DETAIL_QUERY,
	POKEMON_SPECIES_ENCOUNTERS_QUERY,
	POKEMON_SPECIES_MOVES_QUERY,
	REGIONS_QUERY,
	SPECIES_QUERY,
	VERSIONS_QUERY,
} from "../src/graphql/pokeapiQueries";
import {
	listCardThemeFromBase,
	refineExtractedCardBase,
} from "../src/lib/pokemonTypeColors";
import { resolvePokemonSpriteUrl } from "../src/lib/pokeSpriteUrl";
import { sampleDominantHexFromRgba } from "../src/lib/spriteDominantColorCore";
import type { VersionNameRow } from "../src/state/versionRegionFilter";

const DEFAULT_GRAPHQL_URL = "http://localhost:8080/v1/graphql";

const ROOT = path.join(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "generated", "precomputed");
const GRAPHQL_OUT = path.join(OUT_DIR, "graphql-cache.json");
const COLORS_OUT = path.join(OUT_DIR, "sprite-card-themes.json");

/** Extra pause after each GraphQL response (ms); hourly cap is the main throttle. */
const DEFAULT_GRAPHQL_DELAY_MS = 0;
/** Extra pause after each sprite fetch (ms). */
const DEFAULT_SPRITE_DELAY_MS = 0;

const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_MAX_CALLS_PER_HOUR = 100;
const DEFAULT_SAVE_EVERY = 100;

type PrecomputedCache = {
	version: 1;
	species: unknown | null;
	versions: unknown | null;
	regions: unknown | null;
	catchable: unknown | null;
	speciesDetail: Record<string, unknown>;
	encounters: Record<string, unknown>;
	moves: Record<string, unknown>;
};

type EncodedNode =
	| null
	| boolean
	| number
	| string
	| { t: "a"; v: number[] }
	| { t: "o"; v: Record<string, number> };

type PrecomputedCacheV2 = {
	version: 2;
	nodes: EncodedNode[];
	roots: {
		species: number | null;
		versions: number | null;
		regions: number | null;
		catchable: number | null;
		speciesDetail: Record<string, number>;
		encounters: Record<string, number>;
		moves: Record<string, number>;
	};
	movesCompact?: Record<
		string,
		[number, number | null, number | null, number | null, string | null, string | null][]
	>;
};

function decodeNodeFromGraph(
	nodes: EncodedNode[],
	id: number,
	memo: Map<number, unknown>,
): unknown {
	const seen = memo.get(id);
	if (seen !== undefined) return seen;
	const node = nodes[id];
	if (node === undefined) return undefined;
	if (node === null || typeof node !== "object") {
		memo.set(id, node);
		return node;
	}
	if (node.t === "a") {
		const arr = node.v.map((childId) => decodeNodeFromGraph(nodes, childId, memo));
		memo.set(id, arr);
		return arr;
	}
	const obj: Record<string, unknown> = {};
	memo.set(id, obj);
	for (const [k, childId] of Object.entries(node.v)) {
		obj[k] = decodeNodeFromGraph(nodes, childId, memo);
	}
	return obj;
}

function decodeCacheV2ToV1(parsed: PrecomputedCacheV2): PrecomputedCache {
	const memo = new Map<number, unknown>();
	const decodeRoot = (id: number | null) =>
		id == null ? null : decodeNodeFromGraph(parsed.nodes, id, memo);
	const inflateCompactMoves = (
		compactRows: [number, number | null, number | null, number | null, string | null, string | null][],
	) => ({
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
	});
	const decodeRecord = (record: Record<string, number>) =>
		Object.fromEntries(
			Object.entries(record).map(([k, id]) => [k, decodeNodeFromGraph(parsed.nodes, id, memo)]),
		);
	const decodedMoves = decodeRecord(parsed.roots.moves);
	if (parsed.movesCompact) {
		for (const [key, rows] of Object.entries(parsed.movesCompact)) {
			decodedMoves[key] = inflateCompactMoves(rows);
		}
	}
	return {
		version: 1,
		species: decodeRoot(parsed.roots.species),
		versions: decodeRoot(parsed.roots.versions),
		regions: decodeRoot(parsed.roots.regions),
		catchable: decodeRoot(parsed.roots.catchable),
		speciesDetail: decodeRecord(parsed.roots.speciesDetail),
		encounters: decodeRecord(parsed.roots.encounters),
		moves: decodedMoves,
	};
}

function tryReadExistingGraphCache(): PrecomputedCache | null {
	try {
		const parsed = JSON.parse(readFileSync(GRAPHQL_OUT, "utf8")) as PrecomputedCache | PrecomputedCacheV2;
		if (parsed.version === 1) return parsed;
		if (parsed.version === 2) return decodeCacheV2ToV1(parsed);
		return null;
	} catch {
		return null;
	}
}

function encodeToReferencedGraph(cache: PrecomputedCache): PrecomputedCacheV2 {
	const nodes: EncodedNode[] = [];
	const intern = new Map<string, number>();

	const encode = (value: unknown): number => {
		if (
			value === null ||
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			const key = `${typeof value}:${String(value)}`;
			const seen = intern.get(key);
			if (seen !== undefined) return seen;
			const id = nodes.length;
			nodes.push(value);
			intern.set(key, id);
			return id;
		}
		if (Array.isArray(value)) {
			const childIds = value.map((v) => encode(v));
			const key = `a:[${childIds.join(",")}]`;
			const seen = intern.get(key);
			if (seen !== undefined) return seen;
			const id = nodes.length;
			nodes.push({ t: "a", v: childIds });
			intern.set(key, id);
			return id;
		}
		const obj = (value ?? {}) as Record<string, unknown>;
		const entries = Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
		const encodedEntries: Record<string, number> = {};
		const keyParts: string[] = [];
		for (const [k, v] of entries) {
			const childId = encode(v);
			encodedEntries[k] = childId;
			keyParts.push(`${k}:${childId}`);
		}
		const key = `o:{${keyParts.join(",")}}`;
		const seen = intern.get(key);
		if (seen !== undefined) return seen;
		const id = nodes.length;
		nodes.push({ t: "o", v: encodedEntries });
		intern.set(key, id);
		return id;
	};

	const encodeRecord = (record: Record<string, unknown>) =>
		Object.fromEntries(Object.entries(record).map(([k, v]) => [k, encode(v)]));

	const compactMoves: Record<
		string,
		[number, number | null, number | null, number | null, string | null, string | null][]
	> = {};
	for (const [key, payload] of Object.entries(cache.moves)) {
		const rows = (payload as { pokemon_v2_pokemonmove?: unknown[] })?.pokemon_v2_pokemonmove;
		if (!Array.isArray(rows)) continue;
		compactMoves[key] = rows.map((row) => {
			const r = row as {
				id?: number;
				level?: number | null;
				move_learn_method_id?: number | null;
				pokemon_v2_move?: { id?: number | null; pokemon_v2_movenames?: { name?: string }[] } | null;
				pokemon_v2_movelearnmethod?: { name?: string | null } | null;
			};
			return [
				typeof r.id === "number" ? r.id : 0,
				r.level ?? null,
				r.move_learn_method_id ?? null,
				r.pokemon_v2_move?.id ?? null,
				r.pokemon_v2_move?.pokemon_v2_movenames?.[0]?.name ?? null,
				r.pokemon_v2_movelearnmethod?.name ?? null,
			];
		});
	}

	return {
		version: 2,
		nodes,
		roots: {
			species: cache.species == null ? null : encode(cache.species),
			versions: cache.versions == null ? null : encode(cache.versions),
			regions: cache.regions == null ? null : encode(cache.regions),
			catchable: cache.catchable == null ? null : encode(cache.catchable),
			speciesDetail: encodeRecord(cache.speciesDetail),
			encounters: encodeRecord(cache.encounters),
			moves: {},
		},
		movesCompact: compactMoves,
	};
}

function formatMiB(bytes: number): string {
	return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function logGraphCacheStats(raw: PrecomputedCache, encoded: PrecomputedCacheV2): void {
	const rawBytes = Buffer.byteLength(JSON.stringify(raw), "utf8");
	const encodedBytes = Buffer.byteLength(JSON.stringify(encoded), "utf8");
	const ratio = encodedBytes > 0 ? rawBytes / encodedBytes : 0;
	console.log(
		`Graph cache stats: raw ${formatMiB(rawBytes)} -> encoded ${formatMiB(encodedBytes)} (${ratio.toFixed(2)}x smaller).`,
	);
	const movesCount = encoded.movesCompact
		? Object.keys(encoded.movesCompact).length
		: Object.keys(encoded.roots.moves).length;
	console.log(
		`Graph cache refs: nodes=${encoded.nodes.length}, speciesDetail=${Object.keys(encoded.roots.speciesDetail).length}, encounters=${Object.keys(encoded.roots.encounters).length}, moves=${movesCount}.`,
	);
}

function writeGraphCache(cache: PrecomputedCache, tag?: string): void {
	const encoded = encodeToReferencedGraph(cache);
	logGraphCacheStats(cache, encoded);
	writeFileSync(GRAPHQL_OUT, JSON.stringify(encoded));
	if (tag) {
		console.log(`Checkpoint: wrote ${GRAPHQL_OUT} (${tag})`);
	} else {
		console.log(`Wrote ${GRAPHQL_OUT}`);
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function runWithConcurrency<T>(
	items: T[],
	concurrency: number,
	worker: (item: T, idx: number) => Promise<void>,
): Promise<void> {
	if (items.length === 0) return;
	const n = Math.max(1, Math.min(concurrency, items.length));
	let next = 0;
	const runners = Array.from({ length: n }, async () => {
		for (;;) {
			const idx = next;
			next += 1;
			if (idx >= items.length) return;
			await worker(items[idx]!, idx);
		}
	});
	await Promise.all(runners);
}

function numArg(argv: string[], flag: string, fallback: number): number {
	const i = argv.indexOf(flag);
	if (i < 0 || argv[i + 1] === undefined) return fallback;
	const n = Number(argv[i + 1]);
	return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function strArg(argv: string[], flag: string): string | undefined {
	const i = argv.indexOf(flag);
	const v = i < 0 ? undefined : argv[i + 1];
	if (!v || v.startsWith("--")) return undefined;
	return v;
}

function adaptQueryForUnprefixedSchema(query: string): string {
	// Local mirrors can use unprefixed table/relationship names in both selections and filters.
	// Step 1: make every reference unprefixed so args/where keys remain valid.
	const unprefixed = query.replace(/\bpokemon_v2_([a-zA-Z0-9_]+)\b/g, "$1");

	// Step 2: restore response shape by aliasing selected fields back to pokemon_v2_* names.
	const names = new Set<string>();
	for (const m of query.matchAll(/\bpokemon_v2_([a-zA-Z0-9_]+)\b/g)) {
		names.add(m[1]!);
	}
	let withAliases = unprefixed;
	for (const name of names) {
		const re = new RegExp(`(\\s)(${name})(\\s*(?:\\(|\\{|\\n))`, "g");
		withAliases = withAliases.replace(
			re,
			(_m, leadingWs: string, field: string, suffix: string) =>
				`${leadingWs}pokemon_v2_${field}: ${field}${suffix}`,
		);
	}

	// If the source query already had an explicit alias, avoid duplicate alias chains.
	return withAliases.replace(
		/([a-zA-Z0-9_]+)\s*:\s*(pokemon_v2_[a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g,
		"$1: $3",
	);
}

async function supportsPokemonV2Prefix(graphqlUrl: string): Promise<boolean> {
	const res = await fetch(graphqlUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: "query PrefixProbe { __type(name: \"query_root\") { fields { name } } }",
		}),
	});
	if (!res.ok) {
		throw new Error(`GraphQL schema probe failed with HTTP ${res.status}`);
	}
	const json = (await res.json()) as {
		data?: { __type?: { fields?: { name: string }[] } };
		errors?: { message: string }[];
	};
	if (json.errors?.length) {
		throw new Error(`GraphQL schema probe failed: ${json.errors.map((e) => e.message).join("; ")}`);
	}
	const names = new Set((json.data?.__type?.fields ?? []).map((f) => f.name));
	return names.has("pokemon_v2_pokemonspecies");
}

function parseArgs() {
	const argv = process.argv.slice(2);
	const flags = new Set(argv.filter((a) => a.startsWith("--")));

	const sharedDelay = numArg(argv, "--delay-ms", -1);
	const sharedConcurrency = Math.max(1, Math.floor(numArg(argv, "--concurrency", -1)));
	const graphqlDelayMs =
		sharedDelay >= 0
			? sharedDelay
			: numArg(argv, "--graphql-delay-ms", DEFAULT_GRAPHQL_DELAY_MS);
	const spriteDelayMs =
		sharedDelay >= 0
			? sharedDelay
			: numArg(argv, "--sprite-delay-ms", DEFAULT_SPRITE_DELAY_MS);

	const maxCallsPerHour = Math.max(
		1,
		Math.min(10_000, Math.floor(numArg(argv, "--max-calls-per-hour", DEFAULT_MAX_CALLS_PER_HOUR))),
	);
	const saveEvery = Math.max(1, Math.floor(numArg(argv, "--save-every", DEFAULT_SAVE_EVERY)));
	const graphqlConcurrency =
		sharedConcurrency > 0
			? sharedConcurrency
			: Math.max(1, Math.floor(numArg(argv, "--graphql-concurrency", 1)));
	const spriteConcurrency =
		sharedConcurrency > 0
			? sharedConcurrency
			: Math.max(1, Math.floor(numArg(argv, "--sprite-concurrency", 1)));
	const graphqlUrl = strArg(argv, "--graphql-url") ?? process.env.GRAPHQL_URL ?? DEFAULT_GRAPHQL_URL;
	const parsedUrl = new URL(graphqlUrl);
	const host = parsedUrl.hostname.toLowerCase();
	if (host !== "localhost" && host !== "127.0.0.1") {
		throw new Error(
			`Only local GraphQL endpoints are allowed. Got: ${graphqlUrl}. Use localhost or 127.0.0.1.`,
		);
	}

	return {
		quick: flags.has("--quick"),
		graphqlOnly: flags.has("--graphql-only"),
		colorsOnly: flags.has("--colors-only"),
		noWait: flags.has("--no-wait"),
		graphqlDelayMs,
		spriteDelayMs,
		maxCallsPerHour,
		graphqlUrl,
		graphqlConcurrency,
		spriteConcurrency,
		saveEvery,
	};
}

/**
 * Enforces a rolling limit on how many HTTP requests may *start* per hour (all callers share
 * this), plus a minimum gap between consecutive starts so the cap cannot be hit in a few seconds.
 */
function createOutboundHourGate(maxCallsPerHour: number) {
	const minGapMs = Math.ceil(HOUR_MS / maxCallsPerHour);
	const callStartTimes: number[] = [];
	let lastAcquireAt = 0;

	return async function acquireOutboundSlot(): Promise<void> {
		for (;;) {
			const now = Date.now();
			while (callStartTimes.length > 0 && callStartTimes[0]! <= now - HOUR_MS) {
				callStartTimes.shift();
			}

			if (callStartTimes.length >= maxCallsPerHour) {
				const oldest = callStartTimes[0]!;
				await sleep(oldest + HOUR_MS - now + 100);
				continue;
			}

			const sinceLast = lastAcquireAt > 0 ? now - lastAcquireAt : minGapMs;
			if (sinceLast < minGapMs) {
				await sleep(minGapMs - sinceLast);
				continue;
			}

			const t = Date.now();
			lastAcquireAt = t;
			callStartTimes.push(t);
			return;
		}
	};
}

function createRateLimitedGraphql(
	graphqlUrl: string,
	mapQuery: (query: string) => string,
	delayMs: number,
	acquireOutboundSlot: () => Promise<void>,
) {
	return async function graphqlRequest<T>(
		query: string,
		variables?: Record<string, unknown>,
	): Promise<T> {
		try {
			await acquireOutboundSlot();
			const res = await fetch(graphqlUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: mapQuery(query), variables: variables ?? {} }),
			});
			if (!res.ok) {
				throw new Error(`GraphQL HTTP ${res.status}`);
			}
			const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
			if (json.errors?.length) {
				throw new Error(json.errors.map((e) => e.message).join("; "));
			}
			if (json.data === undefined) {
				throw new Error("GraphQL response missing data");
			}
			return json.data;
		} finally {
			await sleep(delayMs);
		}
	};
}

function createRateLimitedSpriteSampler(
	spriteDelayMs: number,
	acquireOutboundSlot: () => Promise<void>,
) {
	return async function sampleThemeForUrl(url: string) {
		try {
			await acquireOutboundSlot();
			const res = await fetch(url);
			if (!res.ok) return null;
			const buf = Buffer.from(await res.arrayBuffer());
			const { data, info } = await sharp(buf)
				.resize(48, 48)
				.ensureAlpha()
				.raw()
				.toBuffer({ resolveWithObject: true });
			if (info.channels !== 4) return null;
			const raw = sampleDominantHexFromRgba(data, info.width, info.height);
			if (!raw) return null;
			const base = refineExtractedCardBase(raw);
			return listCardThemeFromBase(base);
		} catch {
			return null;
		} finally {
			await sleep(spriteDelayMs);
		}
	};
}

function encountersCacheKey(pokemonIds: number[], versionId: number): string {
	const sorted = [...pokemonIds].sort((a, b) => a - b);
	return `${versionId}:${sorted.join(",")}`;
}

async function main() {
	const args = parseArgs();
	mkdirSync(OUT_DIR, { recursive: true });

	const effectiveGraphqlDelayMs = args.noWait ? 0 : args.graphqlDelayMs;
	const effectiveSpriteDelayMs = args.noWait ? 0 : args.spriteDelayMs;
	const acquireOutboundSlot = args.noWait
		? async () => {}
		: createOutboundHourGate(args.maxCallsPerHour);
	if (args.noWait) {
		console.log("Rate limits: disabled (--no-wait); requests may run concurrently without extra delays.");
	} else {
		const minSpacingSec = (HOUR_MS / args.maxCallsPerHour / 1000).toFixed(1);
		console.log(
			`Rate limits: max ${args.maxCallsPerHour} outbound HTTP starts per rolling hour (~${minSpacingSec}s min between starts); +${effectiveGraphqlDelayMs}ms after GraphQL, +${effectiveSpriteDelayMs}ms after sprites.`,
		);
	}
	console.log(
		`Concurrency: graphql=${args.graphqlConcurrency}, sprites=${args.spriteConcurrency}.`,
	);
	console.log(`Checkpointing: every ${args.saveEvery} completed items.`);
	console.log(`GraphQL endpoint: ${args.graphqlUrl}`);
	const hasPokemonV2Prefix = await supportsPokemonV2Prefix(args.graphqlUrl);
	if (!hasPokemonV2Prefix) {
		console.log(
			"GraphQL schema mode: unprefixed local tables detected; applying query alias compatibility.",
		);
	}

	const graphqlRequest = createRateLimitedGraphql(
		args.graphqlUrl,
		hasPokemonV2Prefix ? (q) => q : adaptQueryForUnprefixedSchema,
		effectiveGraphqlDelayMs,
		acquireOutboundSlot,
	);
	const sampleThemeForUrl = createRateLimitedSpriteSampler(
		effectiveSpriteDelayMs,
		acquireOutboundSlot,
	);

	let cache: PrecomputedCache = {
		version: 1,
		species: null,
		versions: null,
		regions: null,
		catchable: null,
		speciesDetail: {},
		encounters: {},
		moves: {},
	};

	if (args.colorsOnly) {
		const existing = tryReadExistingGraphCache();
		if (existing) {
			cache = existing;
		} else {
			throw new Error(`--colors-only requires existing ${GRAPHQL_OUT}; run without --colors-only first.`);
		}
		if (!cache.species || !cache.versions) {
			throw new Error("graphql-cache.json must include species + versions for color extraction.");
		}
	} else {
		console.log("Fetching bootstrap GraphQL queries (sequential)…");
		const existing = tryReadExistingGraphCache();
		if (existing) {
			cache = existing;
			console.log(
				`Resuming from ${GRAPHQL_OUT}: speciesDetail=${Object.keys(cache.speciesDetail).length}, encounters=${Object.keys(cache.encounters).length}, moves=${Object.keys(cache.moves).length}.`,
			);
		}
		if (cache.species == null) cache.species = await graphqlRequest(SPECIES_QUERY);
		if (cache.versions == null) cache.versions = await graphqlRequest(VERSIONS_QUERY);
		if (cache.regions == null) cache.regions = await graphqlRequest(REGIONS_QUERY);
		if (cache.catchable == null) cache.catchable = await graphqlRequest(CATCHABLE_NON_DEFAULT_POKEMON_QUERY);
		writeGraphCache(cache, "after bootstrap");

		const species = cache.species;
		const speciesRows = (species as { pokemon_v2_pokemonspecies?: { id: number }[] })
			.pokemon_v2_pokemonspecies;
		if (!speciesRows?.length) {
			throw new Error("Species query returned no rows.");
		}

		const ids = speciesRows.map((r) => r.id);
		const pendingIds = ids.filter((id) => cache.speciesDetail[String(id)] === undefined);
		console.log(
			`Fetching ${pendingIds.length} species detail queries (${ids.length - pendingIds.length} already cached)…`,
		);

		let detailDone = 0;
		await runWithConcurrency(pendingIds, args.graphqlConcurrency, async (id) => {
			const data = await graphqlRequest(POKEMON_SPECIES_DETAIL_QUERY, { id });
			cache.speciesDetail[String(id)] = data;
			detailDone += 1;
			if (detailDone % args.saveEvery === 0) {
				writeGraphCache(cache, `species detail ${detailDone}/${pendingIds.length}`);
			}
			if (detailDone % 50 === 0) {
				console.log(`  …species detail ${detailDone}/${pendingIds.length}`);
			}
		});

		const versions = cache.versions;
		const versionRows =
			(versions as { pokemon_v2_versionname?: VersionNameRow[] }).pokemon_v2_versionname ?? [];

		if (!args.quick && !args.graphqlOnly) {
			const encounterTasks: { key: string; pokemonIds: number[]; versionId: number }[] = [];
			for (const data of Object.values(cache.speciesDetail)) {
				const row = (data as { pokemon_v2_pokemonspecies?: Record<string, unknown>[] })
					.pokemon_v2_pokemonspecies?.[0] as
					| {
							pokemon_varieties?: { id: number }[];
							pokemon_v2_pokemonspeciesflavortexts?: { version_id: number | null }[];
					  }
					| undefined;
				if (!row) continue;
				const pokemonIds = (row.pokemon_varieties ?? []).map((v) => v.id);
				if (pokemonIds.length === 0) continue;
				const versionIds = new Set<number>();
				for (const ft of row.pokemon_v2_pokemonspeciesflavortexts ?? []) {
					if (ft.version_id != null) versionIds.add(ft.version_id);
				}
				for (const vid of versionIds) {
					const key = encountersCacheKey(pokemonIds, vid);
					if (cache.encounters[key] !== undefined) continue;
					encounterTasks.push({ key, pokemonIds, versionId: vid });
				}
			}

			console.log(`Fetching ${encounterTasks.length} encounter queries…`);
			let encDone = 0;
			await runWithConcurrency(encounterTasks, args.graphqlConcurrency, async (task) => {
				const data = await graphqlRequest(POKEMON_SPECIES_ENCOUNTERS_QUERY, {
					pokemonIds: task.pokemonIds,
					versionId: task.versionId,
				});
				cache.encounters[task.key] = data;
				encDone += 1;
				if (encDone % args.saveEvery === 0) {
					writeGraphCache(cache, `encounters ${encDone}/${encounterTasks.length}`);
				}
				if (encDone % 100 === 0) console.log(`  …encounters ${encDone}/${encounterTasks.length}`);
			});

			const versionGroupIds = new Set<number>();
			for (const r of versionRows) {
				const vg = r.pokemon_v2_version?.version_group_id;
				if (vg != null) versionGroupIds.add(vg);
			}

			const allPokemonIds = new Set<number>();
			for (const data of Object.values(cache.speciesDetail)) {
				const row = (data as { pokemon_v2_pokemonspecies?: Record<string, unknown>[] })
					.pokemon_v2_pokemonspecies?.[0] as { pokemon_varieties?: { id: number }[] } | undefined;
				for (const v of row?.pokemon_varieties ?? []) {
					allPokemonIds.add(v.id);
				}
			}

			const moveTasks: { key: string; pokemonId: number; versionGroupId: number }[] = [];
			for (const pid of allPokemonIds) {
				for (const vg of versionGroupIds) {
					const key = `${pid}:${vg}`;
					if (cache.moves[key] !== undefined) continue;
					moveTasks.push({ key, pokemonId: pid, versionGroupId: vg });
				}
			}

			console.log(`Fetching ${moveTasks.length} move queries…`);
			let mvDone = 0;
			await runWithConcurrency(moveTasks, args.graphqlConcurrency, async (task) => {
				const data = await graphqlRequest(POKEMON_SPECIES_MOVES_QUERY, {
					pokemonId: task.pokemonId,
					versionGroupId: task.versionGroupId,
				});
				cache.moves[task.key] = data;
				mvDone += 1;
				if (mvDone % args.saveEvery === 0) {
					writeGraphCache(cache, `moves ${mvDone}/${moveTasks.length}`);
				}
				if (mvDone % 500 === 0) console.log(`  …moves ${mvDone}/${moveTasks.length}`);
			});
		} else if (args.quick) {
			console.log("Skipping encounters + moves (--quick).");
		}

		writeGraphCache(cache);
	}

	if (args.graphqlOnly) {
		console.log("--graphql-only: skipping sprite colors.");
		return;
	}

	console.log("Collecting sprite URLs and sampling colors…");
	const versionRows =
		(cache.versions as { pokemon_v2_versionname?: VersionNameRow[] }).pokemon_v2_versionname ?? [];
	const versionIds = new Set<number>([0]);
	for (const r of versionRows) {
		if (r.version_id != null) versionIds.add(r.version_id);
	}

	const speciesPayload = cache.species as {
		pokemon_v2_pokemonspecies?: {
			pokemon_v2_pokemons?: {
				pokemon_v2_pokemonsprites?: { sprites: unknown }[];
			}[];
		}[];
	};
	const urlSet = new Set<string>();
	for (const sp of speciesPayload.pokemon_v2_pokemonspecies ?? []) {
		for (const mon of sp.pokemon_v2_pokemons ?? []) {
			const root = mon.pokemon_v2_pokemonsprites?.[0]?.sprites;
			if (root == null) continue;
			for (const vid of versionIds) {
				const url = resolvePokemonSpriteUrl(root, vid, versionRows);
				if (url && /^https?:\/\//i.test(url)) urlSet.add(url);
			}
		}
	}

	const urls = [...urlSet].sort();
	console.log(`Sampling ${urls.length} distinct sprite URLs…`);
	const themes: Record<string, ReturnType<typeof listCardThemeFromBase>> = {};
	let c = 0;
	await runWithConcurrency(urls, args.spriteConcurrency, async (url) => {
		const t = await sampleThemeForUrl(url);
		if (t) themes[url] = t;
		c += 1;
		if (c % args.saveEvery === 0) {
			writeFileSync(COLORS_OUT, JSON.stringify(themes));
			console.log(`Checkpoint: wrote ${COLORS_OUT} (colors ${c}/${urls.length})`);
		}
		if (c % 100 === 0) console.log(`  …colors ${c}/${urls.length}`);
	});

	writeFileSync(COLORS_OUT, JSON.stringify(themes));
	console.log(`Wrote ${COLORS_OUT} (${Object.keys(themes).length} entries)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
