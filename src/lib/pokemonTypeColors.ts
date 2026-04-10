/** Base fill colors (hex) aligned with common Pokémon type palettes. */
const TYPE_HEX: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => clampByte(x).toString(16).padStart(2, '0')).join('')}`;
}

/** Perceived lightness in 0..1 (for tuning extracted palette colors). */
export function rgbLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Keeps artwork-derived base colors in a usable range for card fills
 * (official art often has dark outlines/shadows that skew the dominant swatch).
 */
export function refineExtractedCardBase(hex: string): string {
  const [r, g, b] = parseHex(hex);
  const L = rgbLuminance(r, g, b);
  if (L < 0.2) return lightenHex(hex, 0.38);
  if (L > 0.9) return darkenHex(hex, 0.12);
  return hex;
}

/** Blend toward white (t=0 → a, t=1 → white). */
export function lightenHex(hex: string, t: number): string {
  const [r, g, b] = parseHex(hex);
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

/** Darken for text on a saturated card. */
export function darkenHex(hex: string, t: number): string {
  const [r, g, b] = parseHex(hex);
  return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
}

export function typeBackgroundHex(typeName: string | undefined): string {
  if (!typeName) return TYPE_HEX.normal;
  const key = typeName.toLowerCase();
  return TYPE_HEX[key] ?? TYPE_HEX.normal;
}

export function listCardThemeFromBase(base: string) {
  return {
    cardBg: base,
    text: darkenHex(base, 0.52),
    artBlob: lightenHex(base, 0.42),
    pillBg: lightenHex(base, 0.22),
    pillBorder: darkenHex(base, 0.28),
  };
}

export function listCardTypeTheme(primaryType: string | undefined) {
  return listCardThemeFromBase(typeBackgroundHex(primaryType));
}
