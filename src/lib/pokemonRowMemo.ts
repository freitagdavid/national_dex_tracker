import type { Pokemon } from "@/state";

/**
 * Compare Pokémon row data so `React.memo` can skip when parents rebuild arrays with
 * fresh `Pokemon` instances (new references) but the same visible payload.
 * Intentionally omits deep compares of dex maps — those track `spritesJson`/id/display fields.
 */
export function pokemonRowPropsEqual(a: Pokemon, b: Pokemon): boolean {
	if (a === b) return true;
	if (a.id !== b.id || a.speciesId !== b.speciesId) return false;
	if (
		a.displayName !== b.displayName ||
		a.name !== b.name ||
		a.generationId !== b.generationId ||
		a.spritesJson !== b.spritesJson
	) {
		return false;
	}
	if (a.types.length !== b.types.length) return false;
	for (let i = 0; i < a.types.length; i++) {
		if (a.types[i] !== b.types[i]) return false;
	}
	return true;
}
