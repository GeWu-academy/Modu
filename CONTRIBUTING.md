# Contributing

## Local setup

1. Install the Node.js and pnpm versions required by the selected application's package.json; use Go 1.22+ for the backend.
2. Install only the selected client: `pnpm install:web`, `pnpm install:admin`, or `pnpm install:app`.
3. Run `pnpm dev:<app>`. web is the enterprise website, admin the management console, and app the ordinary-user RN client.
4. Start the backend independently with `pnpm dev:api` or `go run ./cmd/server` inside `apps/api`.

## Change guidelines

- Keep runtime code and shared code inside the owning application. Do not add cross-app dependencies or root shared packages/plugins.
- Run `pnpm check:boundaries`, `pnpm test`, and the selected app's formatting, lint, type checks, and focused tests.
- Keep the OpenAPI contract and affected app-local adapters/types in sync.
- Update architecture documentation when roles or boundaries change.
