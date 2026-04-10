import { useEffect, useRef, useState } from 'react';
import { useSelector } from '@legendapp/state/react';
import type { Pokemon } from '@/state';
import { app } from '@/state';
import { resolvePokemonSpriteUrl } from '@/lib/pokeSpriteUrl';
import {
  spriteUrlLikelyHasOpaqueWhiteBackground,
  spriteUrlToTransparentBlobUrl,
} from '@/lib/spriteChromaKey';

export type PokemonSpriteUrlResult = {
  /** `src` for `<img>` — may be a blob URL after chroma-key processing. */
  url: string;
  /** Stable HTTP(S) URL for the same artwork; use to key caches (blob URLs are unique per load). */
  colorCacheKey: string;
};

/**
 * Era-appropriate sprite when a game is selected; otherwise official artwork.
 * Gen I–III version sprites get a client-side white→transparent pass so they sit on colored cards.
 */
export function usePokemonSpriteUrl(poke: Pokemon): PokemonSpriteUrlResult {
  const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
  const versionRows = useSelector(() => app.state.query.versionRows.get());

  const baseUrl =
    resolvePokemonSpriteUrl(poke.spritesJson, selectedGame, versionRows) ?? poke.sprites.front_default;

  const [displayUrl, setDisplayUrl] = useState(baseUrl);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    setDisplayUrl(baseUrl);

    if (!spriteUrlLikelyHasOpaqueWhiteBackground(baseUrl)) {
      return;
    }

    let cancelled = false;
    void (async () => {
      const blobUrl = await spriteUrlToTransparentBlobUrl(baseUrl);
      if (cancelled) {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        return;
      }
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      if (blobUrl) {
        blobRef.current = blobUrl;
        setDisplayUrl(blobUrl);
      }
    })();

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [baseUrl]);

  return { url: displayUrl, colorCacheKey: baseUrl };
}
