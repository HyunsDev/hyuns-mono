# AGENTS.md for `packages/contract`

This file applies to everything under `packages/contract`.

## Purpose

`@workspace/contract` is the single source of truth for the API contract shared by `apps/api` and `apps/web`.
It defines:

- ts-rest router trees in `src/operations`
- shared Zod schemas, DTOs, enums, and error definitions in `src/resources`
- the public package surface exposed from `src/index.ts`

Contract changes are rarely local. A small schema or path change can break NestJS handlers in `apps/api` and typed consumers in `apps/web`.

## What Lives Where

- `src/index.ts`
  - Public entry point for this package
  - Re-exports `./resources` and `./operations` only
- `src/operations`
  - ts-rest router definitions
  - Root contract is assembled in `src/operations/contract.ts`
  - Each domain uses `*.router.ts`
- `src/resources`
  - Shared runtime schemas and exported types
  - Common file patterns here are `*.schemas.ts`, `*.dto.ts`, `*.errors.ts`, `*.enums.ts`
  - Every domain should re-export through a nearby `index.ts`
- `src/internal`
  - Package-private helpers such as the shared `c = initContract()` instance
  - Never expose this directory from package public exports
- `dist`
  - Build output only
  - Never edit by hand
- `scripts/inspect-contract.mjs`
  - Reads `src/operations/contract.ts` and prints the contract tree
  - Useful after router restructuring or endpoint additions

## Ground Rules

- Prefer editing `src/resources` and `src/operations`; do not treat `dist` as a source of truth.
- Keep runtime schemas and exported TypeScript types together. Follow the existing pattern of `FooSchema` plus `type Foo = z.infer<typeof FooSchema>`.
- Reuse the shared response helpers from `@workspace/shared`, especially `createOkResponseSchema` and `createErrorResponseSchemas`, instead of hand-rolling response maps.
- Reuse aggregated API errors from `ApiErrors` when possible. If you add a new domain error, make sure it is wired into the relevant domain aggregate and then into `src/resources/errors.ts` when it should be globally available.
- Preserve package-private boundaries. `src/internal` may be imported inside this package through `@/internal`, but must not become part of the public package API.
- Follow neighboring files before inventing a new pattern. This package is already large, so consistency with the nearest domain is more important than introducing a new naming scheme.

## Editing Workflow

When adding or changing a contract:

1. Update or add the domain schema/DTO/error files in `src/resources/...`.
2. Re-export the new symbols through the closest `index.ts` files.
3. Update the matching router in `src/operations/...`.
4. If the router tree changed, make sure it is still connected from `src/operations/contract.ts`.
5. If the public package surface changed, verify `src/index.ts`, `src/resources/index.ts`, and any relevant domain `index.ts` files.

When adding an endpoint, match the established ts-rest shape:

- declare `summary`, `description`, `method`, and `path`
- use `pathParams`, `query`, and `body` with explicit Zod schemas
- use `body: c.noBody()` when no request body is allowed
- define responses through the shared response helpers

## Export Discipline

- Public consumers import from `@workspace/contract`, not deep internal files.
- New public resources should flow through `src/resources/**/index.ts` and then `src/resources/index.ts`.
- The root contract object exported from `src/operations/contract.ts` is the main server/client integration point. Keep its shape intentional and stable.
- Avoid exporting one-off helper functions from resource folders unless they are clearly part of the contract surface. Most helpers should stay local.

## Consumer Awareness

- `apps/api` uses this package to bind NestJS handlers via `contract.*` and shared error definitions.
- `apps/web` consumes shared types and schemas from this package.
- Breaking changes include renamed router keys, changed paths or methods, stricter required fields, removed response fields, and removed error variants.

If you make a breaking change, call it out explicitly in your summary or PR notes.

## Validation Commands

Run the smallest useful set after changes:

- `pnpm --filter @workspace/contract typecheck`
- `pnpm --filter @workspace/contract lint`
- `pnpm --filter @workspace/contract build`
- `pnpm --filter @workspace/contract inspect`

When contract changes affect API implementation alignment, also run:

- `pnpm --filter api test:contracts`

## Package-Specific Gotchas

- `src/index.ts` currently exports `resources` and `operations`, not a separate `common` module.
- The contract tree is nested. Adding a child router file is not enough; it must be attached to its parent router and remain reachable from `contract`.
- Error aggregation is hierarchical. Adding `foo.errors.ts` without updating the relevant aggregate file can leave the new error effectively invisible to consumers.
- Some domains use slightly different filenames such as `anchor.schema.ts` or `anchor.utils.ts`. Preserve established local conventions instead of force-renaming adjacent files.
- This package uses the `@/*` path alias for local imports. Prefer that alias for package-internal imports when the surrounding code already uses it.

## Before Finishing

Before wrapping up, sanity-check:

- public exports still resolve from `@workspace/contract`
- new schemas/types are exported from the intended `index.ts` chain
- router additions are reachable from `src/operations/contract.ts`
- generated `dist` files were not manually edited
- the validation commands relevant to the change were run, or explicitly noted if skipped
