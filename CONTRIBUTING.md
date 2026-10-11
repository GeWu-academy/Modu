# Contributing

## Local setup

1. Install Node.js 20+, pnpm 9+, and Go 1.22+.
2. Run `pnpm install`.
3. Start the web app with `pnpm dev`.
4. Start the API separately with `cd apps/api && go run ./cmd/server`.

## Change guidelines

- Keep changes scoped to the relevant app, package, or plugin.
- Run formatting, linting, type checking, and focused tests before opening a pull request.
- Update product or architecture documentation when behavior or boundaries change.
