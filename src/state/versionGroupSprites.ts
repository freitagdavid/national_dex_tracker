/**
 * Maps PokeAPI `version_group.id` to dot-paths under each Pokémon's `sprites` JSON
 * (`front_default` is read from the leaf object). Earlier entries win when present.
 *
 * JSON keys follow the live PokeAPI shape (e.g. gen vi uses `omegaruby-alphasapphire`).
 */
export const VERSION_GROUP_SPRITE_PATHS: Record<number, readonly string[]> = {
  1: ['versions.generation-i.red-blue'],
  2: ['versions.generation-i.yellow'],
  3: ['versions.generation-ii.gold', 'versions.generation-ii.silver'],
  4: ['versions.generation-ii.crystal', 'versions.generation-ii.gold'],
  5: ['versions.generation-iii.ruby-sapphire'],
  6: ['versions.generation-iii.emerald', 'versions.generation-iii.ruby-sapphire'],
  7: ['versions.generation-iii.firered-leafgreen', 'versions.generation-iii.ruby-sapphire'],
  8: ['versions.generation-iv.diamond-pearl'],
  9: ['versions.generation-iv.platinum', 'versions.generation-iv.diamond-pearl'],
  10: ['versions.generation-iv.heartgold-soulsilver', 'versions.generation-iv.diamond-pearl'],
  11: ['versions.generation-v.black-white'],
  12: ['versions.generation-iii.ruby-sapphire'],
  13: ['versions.generation-iii.ruby-sapphire'],
  14: ['versions.generation-v.black-white'],
  15: ['versions.generation-vi.x-y'],
  16: ['versions.generation-vi.omegaruby-alphasapphire', 'versions.generation-vi.x-y'],
  17: ['versions.generation-vii.icons', 'versions.generation-vii.ultra-sun-ultra-moon'],
  18: ['versions.generation-vii.ultra-sun-ultra-moon', 'versions.generation-vii.icons'],
  19: ['versions.generation-vii.icons', 'versions.generation-vii.ultra-sun-ultra-moon'],
  20: ['versions.generation-viii.icons', 'versions.generation-viii.brilliant-diamond-shining-pearl'],
  21: ['versions.generation-viii.icons'],
  22: ['versions.generation-viii.icons'],
  23: ['versions.generation-viii.brilliant-diamond-shining-pearl', 'versions.generation-viii.icons'],
  24: ['versions.generation-viii.icons'],
  25: ['versions.generation-ix.scarlet-violet', 'versions.generation-viii.icons'],
  26: ['versions.generation-ix.scarlet-violet', 'versions.generation-viii.icons'],
  27: ['versions.generation-ix.scarlet-violet', 'versions.generation-viii.icons'],
  28: ['versions.generation-i.red-blue'],
  29: ['versions.generation-i.red-blue'],
  30: ['versions.generation-ix.scarlet-violet', 'versions.generation-viii.icons'],
};
