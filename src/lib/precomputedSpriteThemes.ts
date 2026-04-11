import spriteThemes from "@/generated/precomputed/sprite-card-themes.json";
import type { SpriteCardThemeEntry, SpriteCardThemeJson } from "@/lib/precomputedTypes";

const themes = spriteThemes as SpriteCardThemeJson;

/** Card theme keyed by stable sprite HTTPS URL (`colorCacheKey`). */
export function getPrecomputedSpriteCardTheme(
	url: string | undefined | null,
): SpriteCardThemeEntry | null {
	if (!url?.trim()) return null;
	return themes[url] ?? null;
}
