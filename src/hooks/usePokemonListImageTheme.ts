import { useEffect, useMemo, useState } from "react";
import {
	listCardThemeFromBase,
	listCardTypeTheme,
	refineExtractedCardBase,
} from "@/lib/pokemonTypeColors";
import { getPrecomputedSpriteCardTheme } from "@/lib/precomputedSpriteThemes";
import { sampleDominantCardColor } from "@/lib/spriteDominantColor";

type ListCardTheme = ReturnType<typeof listCardThemeFromBase>;

/**
 * List / modal chrome: prefers a color sampled from artwork (`colorCacheKey` should be a stable
 * HTTPS URL). Falls back to primary type palette when sampling fails or on native.
 * When `sprite-card-themes.json` is populated (`bun run precompute:data`), themes load instantly.
 */
export function usePokemonListImageTheme(
	_imageUrl: string,
	primaryType: string | undefined,
	colorCacheKey: string = _imageUrl,
) {
	const fallbackTheme = useMemo(
		() => listCardTypeTheme(primaryType),
		[primaryType],
	);

	const precomputed = useMemo(
		() => getPrecomputedSpriteCardTheme(colorCacheKey),
		[colorCacheKey],
	);

	/** Only used when `sprite-card-themes.json` has no entry — filled async. */
	const [sampledTheme, setSampledTheme] = useState<ListCardTheme | null>(null);

	useEffect(() => {
		let cancelled = false;

		if (!colorCacheKey?.trim()) {
			setSampledTheme(null);
			return () => {
				cancelled = true;
			};
		}

		if (precomputed) {
			setSampledTheme(null);
			return () => {
				cancelled = true;
			};
		}

		setSampledTheme(null);

		void (async () => {
			const raw = await sampleDominantCardColor(colorCacheKey);
			if (cancelled || !raw) return;
			const base = refineExtractedCardBase(raw);
			setSampledTheme(listCardThemeFromBase(base));
		})();

		return () => {
			cancelled = true;
		};
	}, [colorCacheKey, precomputed]);

	// Apply precomputed themes on the first paint — do not wait for useEffect (avoids flash on scroll).
	const theme = precomputed ?? sampledTheme ?? fallbackTheme;
	return { theme, onArtLoad: () => {} };
}
