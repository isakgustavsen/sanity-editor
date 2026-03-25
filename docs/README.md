# sanity-editor documentation (Docus)

Developer documentation for the **sanity-editor** Nuxt module, built with [Docus](https://docus.dev) (Nuxt Content + Nuxt UI).

## Prerequisites

Use **pnpm** — the repo is a pnpm workspace (`pnpm-workspace.yaml` includes `docs`).

## Install dependencies

From the **repository root** (installs all workspace packages, including `docus` for this site):

```bash
pnpm install
```

If you only work inside `docs/`, install there after ensuring `docs` is listed under `packages` in `pnpm-workspace.yaml`.

## Development

From the **repository root**:

```bash
pnpm docs:dev
```

Or:

```bash
pnpm --filter docs dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

## Production build

```bash
pnpm docs:build
```

Output is under `docs/.output/` (Nitro).

## Native deps (`better-sqlite3`, etc.)

If pnpm blocks install scripts, run `pnpm approve-builds` and approve packages that build native addons (see [pnpm approve-builds](https://pnpm.io/cli/approve-builds)).

## Docus

- [Docus documentation](https://docus.dev)
- Content lives in `docs/content/`
