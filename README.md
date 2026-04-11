# National Dex Tracker

An Expo app (web, iOS, Android) for tracking progress through the Pokémon national Pokédex. Species, sprites, and details are loaded from the public [PokeAPI GraphQL](https://beta.pokeapi.co/graphql/v1beta2) endpoint; progress and filters persist locally.

## Tech stack

| Area | Choices |
|------|---------|
| UI | React 19, React Native, TypeScript |
| Build | Expo SDK 54 (Metro); static web via `expo export -p web` |
| Styling | NativeWind v5 / Tailwind 4, [Gluestack UI](https://gluestack.io/) (CLI-generated components under `src/components/ui/`) |
| Server state | TanStack Query (React Query) |
| Client state | Legend State + AsyncStorage persistence |
| API | GraphQL via `fetch`; types and documents from GraphQL Code Generator (`client` preset) |
| Images | `expo-image` |

Linting uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) via `npm run lint`.

## Prerequisites

- **Node.js** 22+ (matches [Netlify](netlify.toml) production builds)
- **npm** (used in Netlify) or another compatible package manager

## Setup and build

```bash
# install dependencies
npm ci          # or: npm install

# development (Expo dev server)
npm run start

# web in the browser (does not auto-launch a browser; open the URL Metro prints)
npm run web

# production static web bundle → dist/
npm run build
```

For native builds, use `npm run ios` or `npm run android` after configuring the Expo dev environment (Xcode / Android SDK) as in the [Expo docs](https://docs.expo.dev/).

### Web dev: `BROWSER` / `spawn … ENOENT`

Expo opens the dev URL with [better-opn](https://www.npmjs.com/package/better-opn), which honors the `BROWSER` environment variable (same idea as Create React App). If `BROWSER` is set to a binary that is not on your `PATH` (for example `firedragon`), Node throws `spawn firedragon ENOENT` and the CLI exits.

- **Default:** `npm run web` / `bun run web` sets `BROWSER=none` so Metro keeps running; open `http://localhost:8081` (or the URL shown) in your browser yourself.
- **Auto-open:** Fix `BROWSER` (install the browser or point it at something on `PATH`, e.g. `firefox` or `chromium`), then run `npm run web:open` or `BROWSER=firefox bunx expo start --web`.
- **One-off:** `BROWSER=none bunx expo start --web`

### GraphQL code generation

Operations under `src/` are typed against the live PokeAPI schema. Regenerate artifacts in `src/gql/` after changing queries or when you want updated types:

```bash
npm run codegen
```

## Scripts

| Script | Purpose |
|--------|---------|
| `start` | Expo dev server (`expo start`) |
| `web` | Web dev server without auto-opening a browser (`BROWSER=none`) |
| `web:open` | Same as `expo start --web` (uses your `BROWSER` env) |
| `ios` / `android` | Native run targets |
| `build` | Static web export to `dist/` (`expo export -p web`) |
| `lint` / `lint:fix` | Oxlint |
| `codegen` | GraphQL Code Generator → `src/gql/` |

## Deployment

[netlify.toml](netlify.toml) runs `npm ci && npx expo export -p web`, publishes `dist/`, and rewrites routes to `index.html` for SPA hosting. GitHub Pages uses the workflow in [.github/workflows/expo-pages.yml](.github/workflows/expo-pages.yml).

## For reviewers

- **End-to-end typing**: GraphQL operations are colocated with the UI; codegen produces typed document helpers and operation result types, reducing drift between the API and components.
- **Clear state split**: Async species and detail data flow through TanStack Query; UI preferences, boxes, and catch progress use Legend State with persistence.
- **Cross-platform**: Same React Native tree serves mobile and web; web persistence reuses browser `localStorage` keys compatible with the previous Vite deployment.

## License

Private project (`"private": true` in [package.json](package.json)); add a license file here if you open-source it.
