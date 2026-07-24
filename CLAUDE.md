# chat-bot-builder-client

Visual bot flow builder UI for Octadesk. Fork of [typebot.io](https://github.com/baptisteArno/typebot.io), adapted exclusively for bot flow construction (the bot list/runner is managed separately).

## Stack

- **Runtime**: Node.js, Next.js (React)
- **Monorepo**: Turborepo (`turbo`) with Yarn workspaces
- **UI**: Chakra UI, Framer Motion
- **Forms**: react-hook-form + Zod validation
- **Real-time**: Socket.io client
- **Served via**: nginx on port 3000 in K8s

## Architecture

Turbo monorepo. Main app is under `apps/builder/`. The `bot-engine` and `typebot-js` packages must be built before running the builder.

Packages of interest:
- `apps/builder` — Next.js builder UI
- `packages/bot-engine` — shared bot execution engine
- `packages/typebot-js` — embeddable bot JS lib

## Running locally

```bash
yarn install
yarn docker:up            # starts local infra (DB, etc.)
yarn dev:prepare          # builds bot-engine and typebot-js first
yarn dev                  # starts all apps in parallel
# Windows:
set ENVIRONMENT=local && next dev -p 3000
```

## Conventions

- Port: `3000` (hardcoded in Next.js)
- Served on K8s at port 3000 — has its own Helm chart (not base-app)
- `patch-package` is run in postinstall — check `patches/` if upstream deps have local fixes
- DB migrations: `yarn db:migrate`
