/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    query allPokemonSpeciesWithSprites {\n      pokemon_v2_pokemonspecies(order_by: {id: asc}) {\n        name\n        id\n        pokemon_v2_pokemondexnumbers {\n          pokemon_v2_pokedex {\n            name\n            id\n            is_main_series\n          }\n        }\n        pokemon_v2_pokemons {\n          pokemon_v2_pokemonsprites {\n            sprites(path: \"other.official-artwork\")\n          }\n          pokemon_v2_pokemontypes {\n            pokemon_v2_type {\n              name\n              generation_id\n            }\n          }\n        }\n        has_gender_differences\n        capture_rate\n        base_happiness\n      }\n    }\n    ": types.AllPokemonSpeciesWithSpritesDocument,
    "\n  query allVersionsEnglishNames {\n    pokemon_v2_versionname(where: {language_id: {_eq: 9}}) {\n      name\n      id\n      language_id\n      version_id\n    }\n  }\n": types.AllVersionsEnglishNamesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query allPokemonSpeciesWithSprites {\n      pokemon_v2_pokemonspecies(order_by: {id: asc}) {\n        name\n        id\n        pokemon_v2_pokemondexnumbers {\n          pokemon_v2_pokedex {\n            name\n            id\n            is_main_series\n          }\n        }\n        pokemon_v2_pokemons {\n          pokemon_v2_pokemonsprites {\n            sprites(path: \"other.official-artwork\")\n          }\n          pokemon_v2_pokemontypes {\n            pokemon_v2_type {\n              name\n              generation_id\n            }\n          }\n        }\n        has_gender_differences\n        capture_rate\n        base_happiness\n      }\n    }\n    "): (typeof documents)["\n    query allPokemonSpeciesWithSprites {\n      pokemon_v2_pokemonspecies(order_by: {id: asc}) {\n        name\n        id\n        pokemon_v2_pokemondexnumbers {\n          pokemon_v2_pokedex {\n            name\n            id\n            is_main_series\n          }\n        }\n        pokemon_v2_pokemons {\n          pokemon_v2_pokemonsprites {\n            sprites(path: \"other.official-artwork\")\n          }\n          pokemon_v2_pokemontypes {\n            pokemon_v2_type {\n              name\n              generation_id\n            }\n          }\n        }\n        has_gender_differences\n        capture_rate\n        base_happiness\n      }\n    }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query allVersionsEnglishNames {\n    pokemon_v2_versionname(where: {language_id: {_eq: 9}}) {\n      name\n      id\n      language_id\n      version_id\n    }\n  }\n"): (typeof documents)["\n  query allVersionsEnglishNames {\n    pokemon_v2_versionname(where: {language_id: {_eq: 9}}) {\n      name\n      id\n      language_id\n      version_id\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;