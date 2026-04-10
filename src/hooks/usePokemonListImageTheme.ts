import ColorThief from '@neutrixs/colorthief';
import { useCallback, useEffect, useState } from 'react';
import {
  listCardThemeFromBase,
  listCardTypeTheme,
  refineExtractedCardBase,
  rgbToHex,
} from '@/lib/pokemonTypeColors';

const thief = new ColorThief();

/** In-memory cache so scrolling the list does not re-sample the same artwork. */
const dominantHexByUrl = new Map<string, string>();

export function usePokemonListImageTheme(imageUrl: string, primaryType: string | undefined) {
  const fallbackTheme = listCardTypeTheme(primaryType);
  const [imageBase, setImageBase] = useState<string | null>(() => dominantHexByUrl.get(imageUrl) ?? null);

  useEffect(() => {
    setImageBase(dominantHexByUrl.get(imageUrl) ?? null);
  }, [imageUrl]);

  const theme = imageBase != null ? listCardThemeFromBase(imageBase) : fallbackTheme;

  const onArtLoad = useCallback(
    (img: HTMLImageElement) => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const hit = dominantHexByUrl.get(imageUrl);
      if (hit) {
        setImageBase(hit);
        return;
      }
      try {
        const palette = thief.getPalette(img, 5, 10);
        const rgb = palette?.[0];
        if (!rgb) return;
        const refined = refineExtractedCardBase(rgbToHex(rgb[0], rgb[1], rgb[2]));
        dominantHexByUrl.set(imageUrl, refined);
        setImageBase(refined);
      } catch {
        // Tainted canvas (missing CORS) or unsupported decode — keep type-based theme
      }
    },
    [imageUrl],
  );

  return { theme, onArtLoad };
}
