# Repository Guidelines

## Architecture

- `apps/web` is the enterprise public website (Next.js), not the management console.
- `apps/admin` is the management console (React + Vite).
- `apps/app` is the ordinary-user client (React Native + Expo), not a mobile admin console.
- `apps/api` is the backend; business and platform logic live here, and transport code stays under `internal/transport`.
- Each pnpm workspace includes only its own directory (`.`); root tooling never includes application members. This prevents ancestor workspaces from coupling independent installs.
- Each application owns its dependencies, lockfile, configuration, modules, and shared code. Never import another application's source, or introduce root-level shared UI, types, API clients, packages, or runtime plugins.
- Share code only within its owning application: `apps/web/shared`, `apps/admin/src/shared`, `apps/app/src/shared`, or backend platform contracts.
- Each application must install, build, and deploy without the other applications. Root scripts, documentation, and tooling are coordination conveniences, not application dependencies.
- Clients communicate with the backend through the API contract. Keep client adapters and generated types local to each consuming application.
- Business modules depend on their application's platform contracts, not on other modules' internal implementations. Plugins expose local registration metadata and keep module-specific UI inside their owning application.
- The API enforces authentication and authorization. The ordinary-user app must never be granted management permissions merely because it shares a backend with admin.

## Development

- Use pnpm for JavaScript commands. Install in the target app (`pnpm --dir apps/<app> install`); root `pnpm install` does not install all applications.
- Use `gofmt` for Go files.
- Keep API changes synchronized with `apps/api/api/openapi.yaml` and affected app-local API adapters/types. Do not create a root API client package.
- Add tests next to the code they exercise.
- Run `pnpm check:boundaries` and relevant app-specific checks before submitting changes.
