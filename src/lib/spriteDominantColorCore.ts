import { rgbLuminance, rgbToHex } from "@/lib/pokemonTypeColors";

/**
 * Same filtering/averaging as `spriteDominantColor.web.ts`, for any RGBA buffer (length = 4 * w * h).
 */
export function sampleDominantHexFromRgba(
	data: ArrayLike<number>,
	width: number,
	height: number,
): string | null {
	const expected = width * height * 4;
	if (data.length < expected) return null;

	let rSum = 0;
	let gSum = 0;
	let bSum = 0;
	let n = 0;

	for (let i = 0; i < expected; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];
		if (r === undefined || g === undefined || b === undefined || a === undefined) continue;
		if (a < 28) continue;
		const L = rgbLuminance(r, g, b);
		if (L > 0.93 || L < 0.04) continue;
		rSum += r;
		gSum += g;
		bSum += b;
		n++;
	}

	if (n < 8) return null;
	return rgbToHex(rSum / n, gSum / n, bSum / n);
}
