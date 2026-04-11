function capitalizeWord(s: string): string {
	if (!s) return s;
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Human-readable list/card title: species name, or "Species (Form)" for alternate varieties. */
export function listRowDisplayName(
	speciesSlug: string,
	varietyPokemonName: string,
	rowId: number,
	speciesId: number,
): string {
	const speciesTitle = capitalizeWord(speciesSlug);
	if (rowId === speciesId) return speciesTitle;

	const sn = speciesSlug.toLowerCase();
	const vn = varietyPokemonName.toLowerCase();
	if (vn === sn) return speciesTitle;
	if (vn.startsWith(`${sn}-`)) {
		const rest = varietyPokemonName.slice(speciesSlug.length + 1);
		const formLabel = rest
			.split("-")
			.map((w) => capitalizeWord(w))
			.join(" ");
		return `${speciesTitle} (${formLabel})`;
	}

	return varietyPokemonName
		.split("-")
		.map((w) => capitalizeWord(w))
		.join(" ");
}
