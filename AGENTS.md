# Project rules for AI coding agents

> This file is the single source of truth for every AI coding tool used on this
> project. It is synced to CLAUDE.md, .cursorrules, .github/copilot-instructions.md,
> GEMINI.md, .windsurfrules, .clinerules, and .aider.conf.yml by `rulesync`.

## Project overview

rulesync is a CLI + GitHub Action that keeps every AI coding tool's rule file
in sync from a single AGENTS.md.

- Language: TypeScript (strict mode), Node 18+
- CLI framework: commander
- Build: tsup (CJS output, with .d.ts)

## Coding conventions

- TypeScript strict mode is mandatory; no implicit `any`.
- Every exported function gets a JSDoc comment explaining intent.
- Prefer small, single-purpose modules. Adapters live in `src/adapters/`.
- Keep runtime dependencies minimal (currently: `commander`, `chalk`).

## Logging

- Use the `logger` from `src/utils.ts`. Do not call `console.log` directly.
- Success → green ✓, warnings → yellow ⚠, errors → red ✗ (chalk is auto-disabled
  outside a TTY).

## Adding a new adapter

1. Create `src/adapters/<tool>.ts` exporting an `Adapter` object.
2. Register it in `src/adapters/index.ts` and add the name to `AdapterName`.
3. Add a default in `defaultConfig()` in `src/config.ts`.
4. Update the README's "Supported tools" table.

## What to avoid

- Do not introduce new runtime dependencies without discussion.
- Do not commit `dist/`, `node_modules/`, or `.env*`.
- Do not bypass `rulesync check` in CI — fix drift instead.

## Useful commands

- `npm run build` — build the CLI and action with tsup
- `npm run dev` — run the CLI through tsx
- `npx rulesync sync` — regenerate every rule file
- `npx rulesync check` — verify everything is in sync (used by CI)
