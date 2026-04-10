/** PokeAPI gen I–III version sprites are opaque PNGs with a white (or near-white) matte. */
export function spriteUrlLikelyHasOpaqueWhiteBackground(url: string): boolean {
  return /\/sprites\/pokemon\/versions\/generation-(?:i|ii|iii)\//i.test(url);
}

/**
 * Draws the image to a canvas and sets pixels that read as white/near-white to fully transparent.
 * Requires a CORS-enabled image (e.g. raw.githubusercontent.com).
 */
export function spriteUrlToTransparentBlobUrl(
  imageUrl: string,
  options?: { threshold?: number },
): Promise<string | null> {
  const threshold = options?.threshold ?? 248;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w === 0 || h === 0) {
          resolve(null);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i]!;
          const g = d[i + 1]!;
          const b = d[i + 2]!;
          if (r >= threshold && g >= threshold && b >= threshold) {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob ? URL.createObjectURL(blob) : null);
        }, 'image/png');
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
