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

	const [artTheme, setArtTheme] = useState<ListCardTheme | null>(null);

	useEffect(() => {
		let cancelled = false;

		if (!colorCacheKey?.trim()) {
			setArtTheme(null);
			return () => {
				cancelled = true;
			};
		}

		if (precomputed) {
			setArtTheme(precomputed);
			return () => {
				cancelled = true;
			};
		}

		setArtTheme(null);

		void (async () => {
			const raw = await sampleDominantCardColor(colorCacheKey);
			if (cancelled || !raw) return;
			const base = refineExtractedCardBase(raw);
			setArtTheme(listCardThemeFromBase(base));
		})();

		return () => {
			cancelled = true;
		};
	}, [colorCacheKey, precomputed]);

	const theme = artTheme ?? fallbackTheme;
	return { theme, onArtLoad: () => {} };
}
