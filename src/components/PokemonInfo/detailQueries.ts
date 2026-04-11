/** GraphQL documents inlined for Metro (no Vite `?raw` import). */
export const POKEMON_SPECIES_DETAIL_QUERY = `
query PokemonSpeciesDetail($id: Int!) {
  pokemon_v2_pokemonspecies(where: { id: { _eq: $id } }, limit: 1) {
    id
    name
    gender_rate
    capture_rate
    base_happiness
    hatch_counter
    evolution_chain_id
    is_baby
    is_legendary
    is_mythical
    has_gender_differences
    forms_switchable
    order
    pokemon_v2_pokemondexnumbers(order_by: { pokedex_id: asc }) {
      pokedex_number
      pokemon_v2_pokedex {
        name
        is_main_series
        pokemon_v2_region {
          name
        }
      }
    }
    pokemon_v2_pokemonspeciesdescriptions(where: { language_id: { _eq: 9 } }) {
      description
    }
    pokemon_v2_palparks {
      base_score
      rate
      pokemon_v2_palparkarea {
        pokemon_v2_palparkareanames(where: { language_id: { _eq: 9 } }) {
          name
        }
      }
    }
    pokemon_v2_generation {
      id
      pokemon_v2_generationnames(where: { language_id: { _eq: 9 } }) {
        name
      }
    }
    pokemon_v2_growthrate {
      name
    }
    pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: 9 } }) {
      name
      genus
    }
    evolves_from: pokemon_v2_pokemonspecy {
      id
      name
      pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: 9 } }) {
        name
      }
    }
    pokemon_v2_pokemonspeciesflavortexts(
      where: { language_id: { _eq: 9 } }
      order_by: { version_id: asc }
    ) {
      flavor_text
      version_id
      pokemon_v2_version {
        id
        pokemon_v2_versionnames(where: { language_id: { _eq: 9 } }) {
          name
        }
      }
    }
    pokemon_v2_pokemoncolor {
      name
    }
    pokemon_v2_pokemonhabitat {
      name
    }
    pokemon_v2_pokemonshape {
      name
    }
    pokemon_v2_pokemonegggroups {
      pokemon_v2_egggroup {
        name
      }
    }
    pokemon_v2_evolutionchain {
      id
      pokemon_v2_pokemonspecies(order_by: { id: asc }) {
        id
        name
      }
    }
    default_pokemon: pokemon_v2_pokemons(where: { is_default: { _eq: true } }, limit: 1) {
      id
      height
      weight
      base_experience
      pokemon_v2_pokemonsprites {
        sprites
      }
      pokemon_v2_pokemonabilities(order_by: { slot: asc }) {
        is_hidden
        slot
        pokemon_v2_ability {
          id
          name
          pokemon_v2_abilitynames(where: { language_id: { _eq: 9 } }) {
            name
          }
        }
      }
      pokemon_v2_pokemonstats(order_by: { stat_id: asc }) {
        base_stat
        pokemon_v2_stat {
          name
        }
      }
      pokemon_v2_pokemontypes(order_by: { slot: asc }) {
        slot
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonitems {
        rarity
        pokemon_v2_item {
          name
          pokemon_v2_itemnames(where: { language_id: { _eq: 9 } }) {
            name
          }
        }
      }
    }
    pokemon_varieties: pokemon_v2_pokemons(order_by: { id: asc }) {
      id
      name
      is_default
      pokemon_v2_pokemonabilities(order_by: { slot: asc }) {
        is_hidden
        slot
        pokemon_v2_ability {
          id
          name
          pokemon_v2_abilitynames(where: { language_id: { _eq: 9 } }) {
            name
          }
        }
      }
    }
  }
}
`;

export const POKEMON_SPECIES_ENCOUNTERS_QUERY = `
query PokemonSpeciesEncounters($pokemonIds: [Int!]!, $versionId: Int!) {
  pokemon_v2_encounter(
    where: { pokemon_id: { _in: $pokemonIds }, version_id: { _eq: $versionId } }
    order_by: [{ location_area_id: asc }, { min_level: asc }, { id: asc }]
  ) {
    id
    min_level
    max_level
    pokemon_id
    pokemon_v2_locationarea {
      id
      pokemon_v2_locationareanames(where: { language_id: { _eq: 9 } }) {
        name
      }
      pokemon_v2_location {
        pokemon_v2_locationnames(where: { language_id: { _eq: 9 } }) {
          name
        }
        pokemon_v2_region {
          name
        }
      }
    }
    pokemon_v2_encounterslot {
      pokemon_v2_encountermethod {
        name
      }
    }
  }
}
`;

export const POKEMON_SPECIES_MOVES_QUERY = `
query PokemonSpeciesMoves($pokemonId: Int!, $versionGroupId: Int!) {
  pokemon_v2_pokemonmove(
    where: { pokemon_id: { _eq: $pokemonId }, version_group_id: { _eq: $versionGroupId } }
    order_by: [{ move_learn_method_id: asc }, { level: asc }, { order: asc }]
  ) {
    id
    level
    order
    move_learn_method_id
    pokemon_v2_move {
      id
      pokemon_v2_movenames(where: { language_id: { _eq: 9 } }) {
        name
      }
    }
    pokemon_v2_movelearnmethod {
      name
    }
  }
}
`;
