# Repository Guidelines

## Architecture

- `apps/web` contains application composition and platform UI.
- `apps/api` contains business and platform logic; transport code stays under `internal/transport`.
- Shared packages must not import application code.
- Business modules should depend on platform contracts, not on other modules' internal implementations.
- Plugins expose registration metadata and keep module-specific UI isolated.

## Development

- Use pnpm for JavaScript workspace commands.
- Use `gofmt` for Go files.
- Keep API changes synchronized with `apps/api/api/openapi.yaml` and the API client package.
- Add tests next to the code they exercise.
