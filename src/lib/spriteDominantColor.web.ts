import { rgbLuminance, rgbToHex } from "@/lib/pokemonTypeColors";

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
				let rSum = 0;
				let gSum = 0;
				let bSum = 0;
				let n = 0;
				for (let i = 0; i < data.length; i += 4) {
					const a = data[i + 3]!;
					if (a < 28) continue;
					const r = data[i]!;
					const g = data[i + 1]!;
					const b = data[i + 2]!;
					const L = rgbLuminance(r, g, b);
					if (L > 0.93 || L < 0.04) continue;
					rSum += r;
					gSum += g;
					bSum += b;
					n++;
				}
				if (n < 8) {
					resolve(null);
					return;
				}
				resolve(rgbToHex(rSum / n, gSum / n, bSum / n));
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = imageUrl;
	});
}
