/** Extra species strings not populated on hosted GraphQL; loaded from REST `pokemon-species`. */
export async function fetchSpeciesFormDescriptionsEn(speciesId: number): Promise<string[]> {
  const r = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}/`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = (await r.json()) as {
    form_descriptions?: Array<{ description: string; language?: { name?: string } }>;
  };
  return (
    j.form_descriptions
      ?.filter((d) => d.language?.name === 'en')
      .map((d) => d.description.trim())
      .filter(Boolean) ?? []
  );
}
