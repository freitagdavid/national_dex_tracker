/**
 * Fills `src/generated/precomputed/graphql-cache.json` and `sprite-card-themes.json`.
 *
 * All outbound requests are rate-limited with **large delays** by default so we do not
 * hammer PokéAPI / sprite hosts. GraphQL calls run strictly one-after-another with a
 * pause after each response; sprite fetches use a separate throttle.
 *
 * Usage:
 *   bun run scripts/precompute-data.ts
 *   bun run scripts/precompute-data.ts --quick
 *   bun run scripts/precompute-data.ts --graphql-only
 *   bun run scripts/precompute-data.ts --colors-only
 *
 * Options:
 *   --delay-ms <n>           Set both GraphQL and sprite delays (ms). Default: use separate defaults.
 *   --graphql-delay-ms <n>   Pause after each GraphQL response. Default: 1500
 *   --sprite-delay-ms <n>    Pause after each sprite HTTP fetch. Default: 1200
 *   --concurrency <n>        Ignored (kept for CLI compatibility); work is sequential.
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

const GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta2";

const ROOT = path.join(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "generated", "precomputed");
const GRAPHQL_OUT = path.join(OUT_DIR, "graphql-cache.json");
const COLORS_OUT = path.join(OUT_DIR, "sprite-card-themes.json");

/** Default pause after each GraphQL response (ms) — conservative for shared beta API. */
const DEFAULT_GRAPHQL_DELAY_MS = 1500;
/** Default pause after each sprite CDN request (ms). */
const DEFAULT_SPRITE_DELAY_MS = 1200;

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

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function numArg(argv: string[], flag: string, fallback: number): number {
	const i = argv.indexOf(flag);
	if (i < 0 || argv[i + 1] === undefined) return fallback;
	const n = Number(argv[i + 1]);
	return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function parseArgs() {
	const argv = process.argv.slice(2);
	const flags = new Set(argv.filter((a) => a.startsWith("--")));

	const sharedDelay = numArg(argv, "--delay-ms", -1);
	const graphqlDelayMs =
		sharedDelay >= 0
			? sharedDelay
			: numArg(argv, "--graphql-delay-ms", DEFAULT_GRAPHQL_DELAY_MS);
	const spriteDelayMs =
		sharedDelay >= 0
			? sharedDelay
			: numArg(argv, "--sprite-delay-ms", DEFAULT_SPRITE_DELAY_MS);

	return {
		quick: flags.has("--quick"),
		graphqlOnly: flags.has("--graphql-only"),
		colorsOnly: flags.has("--colors-only"),
		graphqlDelayMs,
		spriteDelayMs,
	};
}

/**
 * Strict serialization: one GraphQL request at a time, then a mandatory cool-down.
 */
function createRateLimitedGraphql(delayMs: number) {
	let tail = Promise.resolve();

	return async function graphqlRequest<T>(
		query: string,
		variables?: Record<string, unknown>,
	): Promise<T> {
		await tail;
		let unlock!: () => void;
		tail = new Promise<void>((resolve) => {
			unlock = resolve;
		});
		try {
			const res = await fetch(GRAPHQL_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, variables: variables ?? {} }),
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
			unlock();
		}
	};
}

function createRateLimitedSpriteSampler(spriteDelayMs: number) {
	let tail = Promise.resolve();

	return async function sampleThemeForUrl(url: string) {
		await tail;
		let unlock!: () => void;
		tail = new Promise<void>((resolve) => {
			unlock = resolve;
		});
		try {
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
			unlock();
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

	console.log(
		`Rate limits: ${args.graphqlDelayMs}ms after each GraphQL response, ${args.spriteDelayMs}ms after each sprite fetch (strictly sequential).`,
	);

	const graphqlRequest = createRateLimitedGraphql(args.graphqlDelayMs);
	const sampleThemeForUrl = createRateLimitedSpriteSampler(args.spriteDelayMs);

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
		try {
			cache = JSON.parse(readFileSync(GRAPHQL_OUT, "utf8")) as PrecomputedCache;
		} catch {
			throw new Error(`--colors-only requires existing ${GRAPHQL_OUT}; run without --colors-only first.`);
		}
		if (!cache.species || !cache.versions) {
			throw new Error("graphql-cache.json must include species + versions for color extraction.");
		}
	} else {
		console.log("Fetching bootstrap GraphQL queries (sequential)…");
		cache.species = await graphqlRequest(SPECIES_QUERY);
		cache.versions = await graphqlRequest(VERSIONS_QUERY);
		cache.regions = await graphqlRequest(REGIONS_QUERY);
		cache.catchable = await graphqlRequest(CATCHABLE_NON_DEFAULT_POKEMON_QUERY);

		const species = cache.species;
		const speciesRows = (species as { pokemon_v2_pokemonspecies?: { id: number }[] })
			.pokemon_v2_pokemonspecies;
		if (!speciesRows?.length) {
			throw new Error("Species query returned no rows.");
		}

		const ids = speciesRows.map((r) => r.id);
		console.log(`Fetching ${ids.length} species detail queries…`);

		let detailDone = 0;
		for (const id of ids) {
			const data = await graphqlRequest(POKEMON_SPECIES_DETAIL_QUERY, { id });
			cache.speciesDetail[String(id)] = data;
			detailDone += 1;
			if (detailDone % 50 === 0) {
				console.log(`  …species detail ${detailDone}/${ids.length}`);
			}
		}

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
			for (const task of encounterTasks) {
				const data = await graphqlRequest(POKEMON_SPECIES_ENCOUNTERS_QUERY, {
					pokemonIds: task.pokemonIds,
					versionId: task.versionId,
				});
				cache.encounters[task.key] = data;
				encDone += 1;
				if (encDone % 100 === 0) console.log(`  …encounters ${encDone}/${encounterTasks.length}`);
			}

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
					moveTasks.push({ key, pokemonId: pid, versionGroupId: vg });
				}
			}

			console.log(`Fetching ${moveTasks.length} move queries…`);
			let mvDone = 0;
			for (const task of moveTasks) {
				const data = await graphqlRequest(POKEMON_SPECIES_MOVES_QUERY, {
					pokemonId: task.pokemonId,
					versionGroupId: task.versionGroupId,
				});
				cache.moves[task.key] = data;
				mvDone += 1;
				if (mvDone % 500 === 0) console.log(`  …moves ${mvDone}/${moveTasks.length}`);
			}
		} else if (args.quick) {
			console.log("Skipping encounters + moves (--quick).");
		}

		writeFileSync(GRAPHQL_OUT, JSON.stringify(cache));
		console.log(`Wrote ${GRAPHQL_OUT}`);
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
	for (const url of urls) {
		const t = await sampleThemeForUrl(url);
		if (t) themes[url] = t;
		c += 1;
		if (c % 100 === 0) console.log(`  …colors ${c}/${urls.length}`);
	}

	writeFileSync(COLORS_OUT, JSON.stringify(themes));
	console.log(`Wrote ${COLORS_OUT} (${Object.keys(themes).length} entries)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
