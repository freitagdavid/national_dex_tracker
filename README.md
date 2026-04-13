# National Dex Tracker

An Expo app (web, iOS, Android) for tracking progress through the Pokémon national Pokédex. Species, sprites, and details are loaded from the public [PokeAPI GraphQL](https://beta.pokeapi.co/graphql/v1beta2) endpoint; progress and filters persist locally.

## Tech stack

| Area | Choices |
|------|---------|
| UI | React 19, React Native, TypeScript, [Expo Router](https://docs.expo.dev/router/introduction/) |
| Build | Expo SDK 54 (Metro); static web via `expo export -p web` |
| Styling | [Uniwind](https://uniwind.dev/) + Tailwind CSS 4 ([global.css](global.css)); [Gluestack UI](https://gluestack.io/) (alpha) with TVA under `src/components/ui/` |
| Lists | `@shopify/flash-list`, `@legendapp/list` |
| Server state | TanStack Query (React Query) |
| Client state | Legend State + AsyncStorage persistence |
| API | GraphQL via `fetch`; types and documents from GraphQL Code Generator (`client` preset) |
| Images | `expo-image` |

Linting uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) via `npm run lint` or `bun run lint`.

## Prerequisites

- **Node.js** 22+ (matches [Netlify](netlify.toml) production builds)
- **npm** for Netlify (`npm ci`) or **Bun** locally (this repo ships [bun.lock](bun.lock); use `bun install`)

## Setup and build

```bash
# install dependencies
bun install     # local (lockfile: bun.lock)
# or: npm ci    # CI / Netlify-style

# development (Expo dev server)
bun run start   # or: npm run start

# web in the browser (does not auto-launch a browser; open the URL Metro prints)
bun run web

# production static web bundle → dist/
bun run build
```

For native builds, use `bun run ios` or `bun run android` after configuring the Expo dev environment (Xcode / Android SDK) as in the [Expo docs](https://docs.expo.dev/). The Android script runs [scripts/android-sdk-dir.mjs](scripts/android-sdk-dir.mjs) first to help pick up `ANDROID_SDK_ROOT` / `ANDROID_HOME`.

### Web dev: `BROWSER` / `spawn … ENOENT`

Expo opens the dev URL with [better-opn](https://www.npmjs.com/package/better-opn), which honors the `BROWSER` environment variable (same idea as Create React App). If `BROWSER` is set to a binary that is not on your `PATH` (for example `firedragon`), Node throws `spawn firedragon ENOENT` and the CLI exits.

- **Default:** `bun run web` / `npm run web` sets `BROWSER=none` so Metro keeps running; open `http://localhost:8081` (or the URL shown) in your browser yourself.
- **Auto-open:** Fix `BROWSER` (install the browser or point it at something on `PATH`, e.g. `firefox` or `chromium`), then run `bun run web:open` or `BROWSER=firefox npx expo start --web`.
- **One-off:** `BROWSER=none npx expo start --web`

### GraphQL code generation

Operations under `src/` are typed against the live PokeAPI schema. Regenerate artifacts in `src/gql/` after changing queries or when you want updated types:

```bash
bun run codegen   # or: npm run codegen
```

### Precomputed data (optional)

Some assets under `src/generated/precomputed/` can be refreshed with [scripts/precompute-data.ts](scripts/precompute-data.ts) (Bun + `sharp`). That script rate-limits outbound calls to PokeAPI / sprite URLs; see the file header for flags (`--quick`, `--colors-only`, etc.).

| Script | Purpose |
|--------|---------|
| `precompute:data` | Quick precompute pass (`--quick`) |
| `precompute:data:full` | Full run |
| `precompute:data:colors-only` | Sprite/card color themes only |

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
| `precompute:data` | Precompute GraphQL cache + themes (quick) |
| `precompute:data:full` | Full precompute |
| `precompute:data:colors-only` | Colors-only precompute |
| `gs:add` | Add Gluestack UI components (`bunx gluestack-ui@4.1.0-alpha.3 add`) |

## Deployment

[netlify.toml](netlify.toml) runs `npm ci && npx expo export -p web`, publishes `dist/`, and rewrites routes to `index.html` for SPA hosting. GitHub Pages uses the workflow in [.github/workflows/expo-pages.yml](.github/workflows/expo-pages.yml).

## For reviewers

- **End-to-end typing**: GraphQL operations are colocated with the UI; codegen produces typed document helpers and operation result types, reducing drift between the API and components.
- **Clear state split**: Async species and detail data flow through TanStack Query; UI preferences, boxes, and catch progress use Legend State with persistence.
- **Cross-platform**: Same React Native tree serves mobile and web; web persistence reuses browser `localStorage` keys compatible with the previous Vite deployment.
- **Uniwind**: Metro wires React Native primitives to Tailwind via [global.css](global.css); Gluestack pieces still use TVA/nativewind-utils for variants.

## License

Private project (`"private": true` in [package.json](package.json)); add a license file here if you open-source it.
