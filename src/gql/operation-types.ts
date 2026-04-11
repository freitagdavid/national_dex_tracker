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
        generation_id?: number | null;
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
  pokemon_v2_pokemonsprites?: Array<{ sprites?: unknown } | null> | null;
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
  generation_id?: number | null;
  pokemon_v2_pokemondexnumbers: SpeciesQueryDexRow[];
  pokemon_v2_pokemons?: SpeciesQueryPokemon[] | null;
  has_gender_differences?: boolean | null;
  capture_rate?: number | null;
  base_happiness?: number | null;
};

export type AllPokemonSpeciesWithSpritesQuery = {
  pokemon_v2_pokemonspecies: SpeciesQueryRow[] | null;
};

export type PokemonSpeciesDetailQuery = {
  pokemon_v2_pokemonspecies: Array<{
    id: number;
    name: string;
    gender_rate?: number | null;
    capture_rate?: number | null;
    base_happiness?: number | null;
    hatch_counter?: number | null;
    evolution_chain_id?: number | null;
    is_baby?: boolean | null;
    is_legendary?: boolean | null;
    is_mythical?: boolean | null;
    has_gender_differences?: boolean | null;
    forms_switchable?: boolean | null;
    order?: number | null;
    pokemon_v2_pokemondexnumbers?: Array<{
      pokedex_number: number;
      pokemon_v2_pokedex?: {
        name?: string | null;
        is_main_series?: boolean | null;
        pokemon_v2_region?: { name?: string | null } | null;
      } | null;
    }>;
    pokemon_v2_pokemonspeciesdescriptions?: Array<{ description: string }>;
    pokemon_v2_palparks?: Array<{
      base_score?: number | null;
      rate?: number | null;
      pokemon_v2_palparkarea?: {
        pokemon_v2_palparkareanames: Array<{ name: string }>;
      } | null;
    }>;
    evolves_from?: {
      id: number;
      name: string;
      pokemon_v2_pokemonspeciesnames: Array<{ name: string }>;
    } | null;
    pokemon_v2_generation?: {
      id: number;
      pokemon_v2_generationnames: Array<{ name: string }>;
    } | null;
    pokemon_v2_growthrate?: { name: string } | null;
    pokemon_v2_pokemonspeciesnames: Array<{ name: string; genus: string }>;
    pokemon_v2_pokemonspeciesflavortexts: Array<{
      flavor_text: string;
      version_id: number;
      pokemon_v2_version?: {
        id: number;
        pokemon_v2_versionnames: Array<{ name: string }>;
      } | null;
    }>;
    pokemon_v2_pokemoncolor?: { name: string } | null;
    pokemon_v2_pokemonhabitat?: { name: string } | null;
    pokemon_v2_pokemonshape?: { name: string } | null;
    pokemon_v2_pokemonegggroups: Array<{ pokemon_v2_egggroup?: { name: string } | null }>;
    pokemon_v2_evolutionchain?: {
      id: number;
      pokemon_v2_pokemonspecies: Array<{ id: number; name: string }>;
    } | null;
    default_pokemon: Array<{
      id: number;
      height?: number | null;
      weight?: number | null;
      base_experience?: number | null;
      pokemon_v2_pokemonsprites?: Array<{ sprites?: unknown } | null> | null;
      pokemon_v2_pokemonabilities: Array<{
        is_hidden?: boolean | null;
        slot?: number | null;
        pokemon_v2_ability?: {
          id: number;
          name: string;
          pokemon_v2_abilitynames: Array<{ name: string }>;
        } | null;
      }>;
      pokemon_v2_pokemonstats: Array<{
        base_stat: number;
        pokemon_v2_stat?: { name: string } | null;
      }>;
      pokemon_v2_pokemontypes: Array<{
        slot?: number | null;
        pokemon_v2_type?: { name: string } | null;
      }>;
      pokemon_v2_pokemonitems?: Array<{
        rarity?: number | null;
        pokemon_v2_item?: {
          name: string;
          pokemon_v2_itemnames: Array<{ name: string }>;
        } | null;
      }>;
    }>;
    pokemon_varieties: Array<{
      id: number;
      name: string;
      is_default?: boolean | null;
      pokemon_v2_pokemonabilities: Array<{
        is_hidden?: boolean | null;
        slot?: number | null;
        pokemon_v2_ability?: {
          id: number;
          name: string;
          pokemon_v2_abilitynames: Array<{ name: string }>;
        } | null;
      }>;
    }>;
  }> | null;
};

export type PokemonSpeciesEncountersQuery = {
  pokemon_v2_encounter: Array<{
    id: number;
    min_level?: number | null;
    max_level?: number | null;
    pokemon_id: number;
    pokemon_v2_locationarea?: {
      id: number;
      pokemon_v2_locationareanames: Array<{ name: string }>;
      pokemon_v2_location?: {
        pokemon_v2_locationnames: Array<{ name: string }>;
        pokemon_v2_region?: { name: string } | null;
      } | null;
    } | null;
    pokemon_v2_encounterslot?: {
      pokemon_v2_encountermethod?: { name: string } | null;
    } | null;
  }> | null;
};

export type PokemonSpeciesMovesQuery = {
  pokemon_v2_pokemonmove: Array<{
    id: number;
    level?: number | null;
    order?: number | null;
    move_learn_method_id?: number | null;
    pokemon_v2_move?: {
      id: number;
      pokemon_v2_movenames: Array<{ name: string }>;
    } | null;
    pokemon_v2_movelearnmethod?: { name: string } | null;
  }> | null;
};
