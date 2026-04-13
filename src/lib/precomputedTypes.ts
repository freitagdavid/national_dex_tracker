/** Serialized `listCardThemeFromBase` output in `sprite-card-themes.json`. */
export type SpriteCardThemeEntry = {
	cardBg: string;
	text: string;
	artBlob: string;
	pillBg: string;
	pillBorder: string;
};

export type PrecomputedGraphqlCacheV1 = {
	version: 1;
	species: unknown | null;
	versions: unknown | null;
	regions: unknown | null;
	catchable: unknown | null;
	speciesDetail: Record<string, unknown>;
	encounters: Record<string, unknown>;
	moves: Record<string, unknown>;
};

export type PrecomputedNode =
	| null
	| boolean
	| number
	| string
	| { t: "a"; v: number[] }
	| { t: "o"; v: Record<string, number> };

export type PrecomputedGraphqlCacheV2 = {
	version: 2;
	nodes: PrecomputedNode[];
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

export type PrecomputedGraphqlCache = PrecomputedGraphqlCacheV1 | PrecomputedGraphqlCacheV2;

export type SpriteCardThemeJson = Record<string, SpriteCardThemeEntry>;
