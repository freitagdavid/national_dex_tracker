/**
 * Space-separated RGB channel values (same palette as global.css).
 * Used by useGluestackColors for APIs that need hex (e.g. react-native-calendars).
 */
const light = {
  "--primary": "23 23 23",
  "--primary-foreground": "250 250 250",
  "--card": "255 255 255",
  "--card-foreground": "10 10 10",
  "--secondary": "245 245 245",
  "--secondary-foreground": "23 23 23",
  "--background": "255 255 255",
  "--popover": "255 255 255",
  "--popover-foreground": "10 10 10",
  "--muted": "245 245 245",
  "--muted-foreground": "115 115 115",
  "--destructive": "231 0 11",
  "--destructive-foreground": "250 250 250",
  "--foreground": "10 10 10",
  "--border": "229 229 229",
  "--input": "229 229 229",
  "--ring": "212 212 212",
  "--accent": "247 247 247",
  "--accent-foreground": "52 52 52",
} as const;

const dark = {
  "--primary": "255 245 245",
  "--primary-foreground": "23 23 23",
  "--card": "23 23 23",
  "--card-foreground": "250 250 250",
  "--secondary": "38 38 38",
  "--secondary-foreground": "250 250 250",
  "--background": "10 10 10",
  "--popover": "23 23 23",
  "--popover-foreground": "250 250 250",
  "--muted": "38 38 38",
  "--muted-foreground": "161 161 161",
  "--destructive": "255 100 103",
  "--destructive-foreground": "10 10 10",
  "--foreground": "250 250 250",
  "--border": "46 46 46",
  "--input": "46 46 46",
  "--accent": "38 38 38",
  "--accent-foreground": "250 250 250",
  "--ring": "115 115 115",
} as const;

export const colors = {
  light,
  dark,
} as const;

export const config = {};
