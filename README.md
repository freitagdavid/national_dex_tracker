# National Dex Tracker

A single-page web app for tracking progress through the Pokémon national Pokédex. Species, sprites, and details are loaded from the public [PokeAPI GraphQL](https://beta.pokeapi.co/graphql/v1beta2) endpoint; progress and filters persist in the browser.

## Tech stack

| Area | Choices |
|------|---------|
| UI | React 19, TypeScript |
| Build | Vite 8, `@vitejs/plugin-react-swc` |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Server state | TanStack Query (React Query) |
| Client state | Legend State |
| API | GraphQL via `fetch`; types and documents from GraphQL Code Generator (`client` preset) |
| Components | Radix UI primitives, shadcn-style patterns (`components.json`) |

Linting in CI-friendly scripts uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html); ESLint remains available in the repo for editor integration if configured locally.

## Prerequisites

- **Node.js** 22+ (matches [Netlify](netlify.toml) production builds)
- **npm** (used in Netlify) or **Bun** (works with the same scripts; e.g. `bun dev`)

This repo includes [`.npmrc`](.npmrc) with `legacy-peer-deps=true` for dependency resolution; keep that in mind if you switch package managers.

## Setup and build

```bash
# install dependencies
npm ci          # or: npm install / bun install

# local development (HMR)
npm run dev     # or: bun dev

# production bundle → dist/
npm run build

# serve the production build locally
npm run preview
```

### GraphQL code generation

Operations under `src/` are typed against the live PokeAPI schema. Regenerate artifacts in `src/gql/` after changing queries or when you want updated types:

```bash
npm run codegen
```

## Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Vite dev server |
| `build` | Optimized static output to `dist/` |
| `preview` | Preview the production build |
| `lint` / `lint:fix` | Oxlint |
| `codegen` | GraphQL Code Generator → `src/gql/` |

## Deployment

The app is a static SPA (`vite` `base: './'`). [netlify.toml](netlify.toml) runs `npm ci && npm run build`, publishes `dist/`, and rewrites all routes to `index.html` for client-side routing and deep links.

## For reviewers

- **End-to-end typing**: GraphQL operations are colocated with the UI; codegen produces typed document helpers and operation result types, reducing drift between the API and components.
- **Clear state split**: Async species and detail data flow through TanStack Query; UI preferences, boxes, and catch progress use Legend State with persistence-oriented patterns suitable for a tracker.
- **Modern frontend defaults**: React 19, Vite + SWC, Tailwind 4 via the official Vite plugin, and accessible primitives (Radix) for dialogs, menus, and form controls.
- **Real public API**: No custom backend; the app demonstrates integrating a documented third-party GraphQL API, error handling, and loading states in a production-shaped UI.

## License

Private project (`"private": true` in [package.json](package.json)); add a license file here if you open-source it.
