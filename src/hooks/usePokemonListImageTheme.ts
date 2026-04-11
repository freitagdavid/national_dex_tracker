import { useEffect, useMemo, useState } from "react";
import {
	listCardThemeFromBase,
	listCardTypeTheme,
	refineExtractedCardBase,
} from "@/lib/pokemonTypeColors";
import { sampleDominantCardColor } from "@/lib/spriteDominantColor";

type ListCardTheme = ReturnType<typeof listCardThemeFromBase>;

/**
 * List / modal chrome: prefers a color sampled from artwork (`colorCacheKey` should be a stable
 * HTTPS URL). Falls back to primary type palette when sampling fails or on native.
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

	const [artTheme, setArtTheme] = useState<ListCardTheme | null>(null);

	useEffect(() => {
		let cancelled = false;
		setArtTheme(null);

		if (!colorCacheKey?.trim()) {
			return () => {
				cancelled = true;
			};
		}

		void (async () => {
			const raw = await sampleDominantCardColor(colorCacheKey);
			if (cancelled || !raw) return;
			const base = refineExtractedCardBase(raw);
			setArtTheme(listCardThemeFromBase(base));
		})();

		return () => {
			cancelled = true;
		};
	}, [colorCacheKey]);

	const theme = artTheme ?? fallbackTheme;
	return { theme, onArtLoad: () => {} };
}
