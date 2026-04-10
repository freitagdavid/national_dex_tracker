import { useEffect, useRef, useState } from 'react';
import { useSelector } from '@legendapp/state/react';
import type { Pokemon } from '@/state';
import { app } from '@/state';
import { resolvePokemonSpriteUrl } from '@/lib/pokeSpriteUrl';
import {
  spriteUrlLikelyHasOpaqueWhiteBackground,
  spriteUrlToTransparentBlobUrl,
} from '@/lib/spriteChromaKey';
import type { PokemonSpriteUrlResult } from '@/hooks/usePokemonSpriteUrl';

/**
 * Sprite URL for the info modal using **modal** game selection (not list filter).
 */
export function useModalPokemonSpriteUrl(
  poke: Pokemon | undefined,
  modalVersionId: number,
): PokemonSpriteUrlResult {
  const versionRows = useSelector(() => app.state.query.versionRows.get());

  const colorCacheKey =
    poke == null
      ? ''
      : (resolvePokemonSpriteUrl(poke.spritesJson, modalVersionId, versionRows) ??
        poke.sprites.front_default);

  const [displayUrl, setDisplayUrl] = useState(colorCacheKey);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    setDisplayUrl(colorCacheKey);

    if (!colorCacheKey || !spriteUrlLikelyHasOpaqueWhiteBackground(colorCacheKey)) {
      return;
    }

    let cancelled = false;
    void (async () => {
      const blobUrl = await spriteUrlToTransparentBlobUrl(colorCacheKey);
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
  }, [colorCacheKey]);

  return { url: displayUrl, colorCacheKey };
}
