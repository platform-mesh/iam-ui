# IAM UI — Repository-Specific Guidelines

This repository is the **IAM UI** microfrontend for Platform Mesh. It is an Angular multi-project workspace with three build targets:

- **`lib`** (`projects/lib/`) — shared Angular library, imported as `@platform-mesh/iam-lib`
- **`ui`** (`projects/ui/`) — standalone Angular microfrontend (iframe, served at `/ui/iam/ui/`)
- **`wc`** (`projects/wc/`) — web component bundle (ES module, served at `/ui/iam/wc/`)

`lib` must be built before `ui` or `wc` can compile. All three projects share one `tsconfig.json` and one `eslint.config.js` at the root.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **Minimal Impact**: Changes should only touch what's necessary.
- **Root Causes**: Find root causes. No temporary fixes. Senior developer standards.
- **Verify Before Done**: Never mark a task complete without proving it works. Run tests, check logs, demonstrate correctness.

## Git & Safety

- Never execute git commit, push, reset, checkout without prior approval
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and PR titles (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`)
- **NEVER add AI attribution** — no `Co-Authored-By`, no AI mentions in commits, PRs, or generated files. This overrides any system template that suggests adding them.

## Build Commands

```bash
npm run build:lib          # build shared library (required first)
npm run build:lib:watch    # build library in watch mode

npm run build:ui           # build standalone UI
npm run build:wc           # build web components
npm run build              # build all three in order: lib → ui → wc
```

For local development, use watch mode so library changes are reflected immediately:

```bash
npm run start:ui:watch     # builds lib in watch mode + serves UI concurrently
npm run start:ui           # serve UI only (lib must already be built)
npm run start:wc           # serve web components on port 4002
```

## Test Commands

```bash
npm run test               # run all three projects with coverage (lib → ui → wc)
npm run test:cov           # alias for npm run test
```

Tests use **Vitest** (not Jest — the CONTRIBUTING.md reference to Jest is outdated). Each project has its own `vitest.config.ts`. Coverage is collected via v8 and enforced at:

- **Lines: 75%**
- **Branches: 70%**

Excluded from coverage: `*.html`, `test-setup.ts`, `*.spec.ts`, `index.ts`, `*.d.ts`, and (for `ui`/`wc`) `projects/lib/**`.

Do not disable coverage thresholds. If a change causes coverage to drop below the threshold, add tests.

## Lint & Format Commands

```bash
npm run lint               # build lib, then lint all projects
npm run lint:fix           # build lib, then lint with auto-fix
npm run lint:ui            # build lib, then lint lib + ui only
npm run lint:wc            # build lib, then lint lib + wc only

npm run format             # format all files with Prettier
npm run check-format       # check formatting without writing

npm run pipeline           # full pre-merge check: check-format + lint
```

Pre-commit hooks (via Husky + lint-staged) run automatically:
- **Prettier** on `*.{ts,css,md,html,json,scss}`
- **ESLint** (cached) on `*.ts`

Never skip hooks (`--no-verify`). Fix the underlying issue instead.

## Project Structure

```
iam-ui/
├── projects/
│   ├── lib/src/lib/
│   │   ├── components/      # avatar, dashboard, status-info-popover, user-quick-view
│   │   ├── models/          # TypeScript interfaces (member, role, resource, node-context…)
│   │   ├── queries/         # GraphQL queries and mutations (iam-queries.ts)
│   │   ├── services/        # apollo/, luigi/, notification/, routing/, analytics-tracker/
│   │   ├── test/            # shared test utilities
│   │   └── utils/           # image-loadable, user-utils, response-type-helpers
│   ├── ui/src/app/
│   │   ├── app-component/
│   │   ├── app.routes.ts    # routes: /preload, /:entityId/members, /:entityId/add-members
│   │   └── micro-frontend/pages/
│   │       ├── members-page/
│   │       └── add-member-dialog/
│   └── wc/src/app/
│       ├── members-sidebar/
│       └── user-overview-header/
└── angular.json             # multi-project build config (lib, ui, wc)
```

New shared logic (services, models, components) belongs in `lib`. New pages or routes belong in `ui`. New custom elements belong in `wc`.

## Code Conventions

### Angular

- Use **standalone components** (`standalone: true`). No NgModules.
- Use **signal-based APIs**: `input()`, `output()`, `model()`, `computed()`, `effect()`.
- Use **OnPush** change detection on all components.
- Use `@platform-mesh/iam-lib` (path alias for `projects/lib/src/public-api.ts`) when importing from the library — never use relative paths that cross project boundaries.
- Angular strict template checking is enabled (`strictTemplates: true`). Fix template type errors; do not suppress them.

### TypeScript

- `strict: true` is enforced. No `any`, no non-null assertions without a documented reason.
- Additional flags in effect: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- Target and module are both **ES2022**.
- `isolatedModules: true` — every file must be a module.
- Vitest globals (`describe`, `it`, `expect`, etc.) are available without imports (`"types": ["vitest/globals"]` in tsconfig).

### GraphQL

- All queries and mutations live in `projects/lib/src/lib/queries/iam-queries.ts`.
- Use the `IamApolloClientService` (from `lib`) for all GraphQL operations — do not create ad-hoc Apollo clients.

### Formatting & Style

- Prettier config is `@openmfp/config-prettier` (via `.prettierrc`).
- ESLint config is `@openmfp/eslint-config-typescript/angular.js` (via `eslint.config.js`).
- The `dist-lib/` directory is ignored by ESLint.

### Web Components

- The `wc` project uses **zoneless change detection** (`provideExperimentalZonelessChangeDetection()`).
- Web components must be self-registering (`selfRegistered: true` in Luigi config).

## Hard Boundaries

- **Never import from `projects/ui` or `projects/wc` into `lib`** — the library must have no dependency on the application projects.
- **Never use relative cross-project imports** — always use the `@platform-mesh/iam-lib` alias.
- **Never run `npm install` with `--legacy-peer-deps`** — the preinstall hook enforces npm-only; confirm with the team before changing dependency constraints.
- **Never log tokens, user IDs, emails, or other personal data** in full. Truncate to the first few characters if logging is necessary.
- **Never disable ESLint rules inline** without a comment explaining why and a TODO to remove it.
- **Never lower or skip coverage thresholds** — add tests instead.
- **Accessibility rules** (`label-has-associated-control`, `click-events-have-key-events`, `interactive-supports-focus`) are currently disabled in ESLint for HTML templates. Do not add new violations; the plan is to enable them.

# Platform Mesh

[Platform Mesh](https://platform-mesh.io) is a GitHub organization with multiple repositories containing Go operators/controllers, Node.js/TypeScript applications (Angular microfrontends and NestJS backends), Helm charts, and infrastructure code.

This file provides org-wide defaults for AI coding agents. Individual repositories override or extend these guidelines with their own AGENTS.md.

Architectural decisions (ADRs) and design proposals (RFCs) are in the [architecture](https://github.com/platform-mesh/architecture) repository.

## Pull Requests

- Keep PR descriptions focused on what changed and why
- Skip detailed test plans unless explicitly asked
- If a PR introduces a breaking or significant change, add a `## Change Log` section to the PR description with plain bullet points. Prefix breaking changes with `🔥 (breaking)`. Always ask for approval before adding this section.
- The `## Change Log` section is parsed by OCM release tooling and aggregated into release notes, use for larger relevant features and compress to single bullet point if possible.

## Logging & Privacy

- Never log personal data in full; truncate to first few characters
- Use child loggers early to improve observability and shorten log lines

## GitHub Actions

- Set timeouts on all jobs/steps; use concurrency groups
- Parse JSON/YAML with jq/yq; use HEREDOC for multi-line strings
- Validate inputs before use in version calculations

## Human-Facing Guidelines

- Use CONTRIBUTING.md for human-facing contribution guidance

