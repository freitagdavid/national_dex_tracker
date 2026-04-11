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

export type SpriteCardThemeJson = Record<string, SpriteCardThemeEntry>;
