import { sampleDominantHexFromRgba } from "@/lib/spriteDominantColorCore";

/**
 * Samples a representative fill color from remote sprite/artwork (HTTPS, CORS-enabled).
 * Skips near-white mattes and near-black outlines so the average reflects Pokémon hues.
 */
export async function sampleDominantCardColor(imageUrl: string): Promise<string | null> {
	if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
		return null;
	}

	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			try {
				const w = img.naturalWidth;
				const h = img.naturalHeight;
				if (w === 0 || h === 0) {
					resolve(null);
					return;
				}
				const sampleSize = 48;
				const canvas = document.createElement("canvas");
				canvas.width = sampleSize;
				canvas.height = sampleSize;
				const ctx = canvas.getContext("2d", { willReadFrequently: true });
				if (!ctx) {
					resolve(null);
					return;
				}
				ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
				const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
				resolve(sampleDominantHexFromRgba(data, sampleSize, sampleSize));
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = imageUrl;
	});
}
