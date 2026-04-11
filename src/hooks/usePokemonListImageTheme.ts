import { useMemo } from "react";
import { listCardTypeTheme } from "@/lib/pokemonTypeColors";

/**
 * List row chrome from primary type. (Web-only dominant-color sampling from artwork was removed for Expo/RN.)
 */
export function usePokemonListImageTheme(
	_imageUrl: string,
	primaryType: string | undefined,
	_colorCacheKey: string = _imageUrl,
) {
	const theme = useMemo(() => listCardTypeTheme(primaryType), [primaryType]);
	return { theme, onArtLoad: () => {} };
}
