# Repository Guidelines

## Small-MVP Workflow and Change Records

- Treat every independent task, including discussion, documentation, implementation, investigation, and fixes, as a small MVP: define the goal and scope, record the plan, make the smallest complete change, verify it, and record the result. Do not expand unrelated functionality or perform opportunistic refactors.
- Read the applicable instructions and relevant files first. Before substantive task work or implementation, create `changes/YYYY-MM-DD-NN-short-topic/` using the user's local date, a same-day sequence number, and a descriptive lowercase kebab-case topic. When these rules are introduced or explicitly waived, document that exception rather than inventing earlier records.
- Use one directory per independent task, not per message. Follow-up discussions, implementation, and fixes for the same goal update the existing directory, even across dates; a genuinely new goal gets a new directory. Do not overwrite another task's records or retroactively rewrite its history.
- Create both `plan.md` and `result.md` at the start. Keep records concise and free of credentials, sensitive data, and raw chat transcripts. The root `changes/` directory is documentation, not an application runtime dependency.
- `plan.md` must include the task date and background, the goal and minimum deliverable, included and excluded scope, confirmed decisions and open questions, expected file additions/modifications/deletions with reasons, implementation steps, and acceptance criteria with verification methods. Repository-relative paths in change-record file inventories are permitted for portability.
- Update the plan before changing the scope, key approach, or expected file set. Discuss decisions requiring user input before implementing them; record the reasons for deviations, and do not silently broaden the task.
- `result.md` must include the current status (`discussion`, `in progress`, `completed`, or `blocked`), a task-specific checklist updated during work, actual changed files, verification commands and outcomes, and deviations, blockers, remaining issues, and follow-up suggestions. Chinese equivalents of these status labels are permitted.
- Mark checklist items complete only when supported by actual work or verification. Distinguish passed, failed, not run, blocked, and not applicable checks; explain skipped or inapplicable checks instead of marking them passed. Discussion tasks deliver confirmed decisions and open questions, not claims of implemented code.
- Before declaring completion, reconcile planned and actual file changes, verify the acceptance criteria, run `pnpm check:boundaries` and relevant app-specific checks, and finish the result record. For documentation-only tasks, record why app-specific checks are not applicable. If work is incomplete, preserve the truthful status and state what remains.
- Keep change records available for future review. Do not automatically stage, commit, push, or delete records merely because a task is complete.

## Technical Baseline

- This is a monorepo of independently owned and delivered applications, not a shared application dependency workspace. Monorepo organization does not relax the architecture boundaries below.
- Frontend application code uses TypeScript; backend code uses Go. Build/configuration scripts may use the formats required by their tools.
- Frontend server-derived data and its request/cache lifecycle use TanStack Query. Shared client-only state uses Zustand; component-local state stays local. Do not duplicate API response caches in Zustand. Each application owns its query client, stores, adapters, and dependencies, and installs them only when needed.
- The selected backend foundation is Go + Gin + GORM + PostgreSQL + Redis + Asynq. Gin handles HTTP transport; business rules stay outside handlers; GORM persistence implementations stay behind application-local contracts. Redis does not replace PostgreSQL as the authoritative business data store, and Asynq tasks must define idempotency, retry, and failure handling.
- Database schema changes use versioned migrations; do not use production GORM AutoMigrate as a substitute. Keep transaction boundaries explicit, and do not treat database commits and task enqueue operations as automatically atomic.
- See `docs/architecture/tech-stack.md` for selection rationale, responsibilities, adoption status, and version policy. A selected technology is not necessarily integrated; do not install the entire target stack or claim it is operational during an unrelated task.

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

- The root `docs/` directory is local-only. Never commit any files within it, including nested files, add ignore exceptions, or force-add them with `git add -f`. Keep existing local files when removing them from Git tracking.
- Use pnpm for JavaScript commands. Install in the target app (`pnpm --dir apps/<app> install`); root `pnpm install` does not install all applications.
- Use `gofmt` for Go files.
- Keep application-specific commands and framework rules in the owning application's README or AGENTS.md; keep design rationale in architecture documentation. Do not duplicate detailed rules in the root guidelines or bypass the local-only `docs/` policy above.

## Workspace and Git Safety

- Inspect Git status and relevant diffs before editing. Preserve user and other-task changes; if they conflict with the requested work, discuss the conflict rather than overwrite or revert them.
- Destructive resets, untracked-file cleanup, discarding changes, and force-pushes require explicit authorization for the affected scope. A request to implement a feature is not authorization to discard unrelated work.
- Keep edits scoped to the task. Do not perform unrelated formatting, dependency upgrades, or file regeneration; inspect generated diffs and change only the owning application's dependency and lock files when needed.

## Security and Data Protection

- Never put credentials, access tokens, private keys, or real sensitive data in source code, logs, fixtures, or change records. Environment-variable examples must use placeholders; redact sensitive fields in logs and errors.
- Production data writes, production deployments, and destructive database migrations require explicit authorization plus an impact and recovery plan. Authorization to edit local code does not authorize production operations.
- Deny access by default and validate authentication, permissions, resource ownership, and applicable tenant scope on every protected request. Derive authorization context from trusted server-side identity; frontend checks and client-supplied owner or tenant IDs are not proof of access.
- Tests must cover denied access and cross-owner or cross-tenant attempts when those boundaries apply. Security requirements here are constraints, not claims that authentication or tenant isolation is already implemented.

## API Contract and Compatibility

- Keep API changes synchronized with `apps/api/api/openapi.yaml` and affected app-local API adapters/types. Do not create a root API client package or expose persistence models directly as public response contracts; explicitly map permitted fields.
- Before breaking an API contract, identify affected consumers and confirm a compatibility or migration plan. Do not assume independently delivered clients will upgrade together.
- Define error responses, pagination, monetary precision/rounding, and time/timezone semantics in the contract when relevant to the feature. Do not silently change existing semantics or choose unspecified business rules without confirmation.

## Testing and Verification

- Add tests next to the code they exercise. Bug fixes should include a regression test that reproduces the failure; if this is not feasible, record why and the alternative verification used.
- Match verification to risk: cover failure paths and boundaries for authorization, monetary calculations, state transitions, and asynchronous idempotency when affected, not only happy paths.
- Read the target application's actual scripts and tool configuration before running checks. When adding or changing verification commands, document them in that application's README; do not invent missing commands or install a test framework merely to standardize the applications.
- Run `pnpm check:boundaries`, `pnpm test` (root tooling tests), and relevant app-specific lint, type checks, tests, and builds before submitting changes. Root tooling tests are not application tests; document any missing, failed, blocked, or inapplicable checks and the resulting verification gaps.
- Boundary checks are guardrails, not complete semantic analysis: computed imports and arbitrary build configuration still require review. A passing checker does not authorize cross-application dependencies.
