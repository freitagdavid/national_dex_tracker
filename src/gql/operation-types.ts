/** GraphQL operation result shapes for inline queries (see codegen.ts documents). */

export type AllVersionsEnglishNamesQuery = {
  pokemon_v2_versionname: Array<{
    name: string;
    id: number;
    language_id?: number | null;
    version_id?: number | null;
    pokemon_v2_version?: {
      id: number;
      version_group_id?: number | null;
      pokemon_v2_versiongroup?: {
        pokemon_v2_versiongroupregions: Array<{
          pokemon_v2_region?: { name: string } | null;
        }>;
      } | null;
    } | null;
  }> | null;
};

export type AllRegionsEnglishNamesQuery = {
  pokemon_v2_region: Array<{
    id: number;
    name: string;
    pokemon_v2_regionnames: Array<{ name: string }>;
  }> | null;
};

export type SpeciesQueryPokemon = {
  pokemon_v2_pokemonsprites?: Array<{ sprites?: { front_default?: string | null; front_shiny?: string | null } | null }> | null;
  pokemon_v2_pokemontypes?: Array<{ pokemon_v2_type?: { name?: string | null; generation_id?: number | null } | null }> | null;
};

export type SpeciesQueryDexRow = {
  pokedex_number: number;
  pokemon_v2_pokedex?: {
    is_main_series: boolean;
    pokemon_v2_region?: { name: string } | null;
    pokemon_v2_pokedexversiongroups: Array<{ version_group_id?: number | null }>;
  } | null;
};

export type SpeciesQueryRow = {
  name: string;
  id: number;
  pokemon_v2_pokemondexnumbers: SpeciesQueryDexRow[];
  pokemon_v2_pokemons?: SpeciesQueryPokemon[] | null;
  has_gender_differences?: boolean | null;
  capture_rate?: number | null;
  base_happiness?: number | null;
};

export type AllPokemonSpeciesWithSpritesQuery = {
  pokemon_v2_pokemonspecies: SpeciesQueryRow[] | null;
};
