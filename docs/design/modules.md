# react-render-budget Modules

This note maps the repo's main modules using the shared codebase-design vocabulary: module, interface, implementation, seam, and adapter.

## Package Interface Module

**External seam**: Package subpath imports.

**Interface**:

- `react-render-budget`: shared public types only.
- `react-render-budget/react`: React instrumentation.
- `react-render-budget/playwright`: Playwright helpers.

**Implementation**: The package export map routes each subpath to its runtime or type surface.

**Design note**: Root runtime exports stay intentionally absent to preserve optional Playwright peer behavior.

## React Instrumentation Module

**External seam**: `RenderProfiler` and `withRenderCounter`.

**Interface**: Callers choose explicit budget targets and render or wrap only what they want measured.

**Implementation**: The React adapters record profiler events and component function calls into the internal browser-page stats store.

## Internal Browser-Page Stats Store Module

**Internal seam**: Functions used by instrumentation, tests, and Playwright page evaluation.

**Interface**: Record profiler events, increment component counts, read a render stats snapshot, and reset the store.

**Implementation**: Private `window` storage. Global variable names are not public integration points.

## Budget Evaluation Module

**Internal seam**: Pure functions over `RenderStatsSnapshot` and `RenderBudget`.

**Interface**: `evaluateRenderBudget(snapshot, budget)` and `assertRenderBudget(snapshot, budget)`.

**Implementation**: Normalizes numeric shorthand, checks missing targets, checks metric maxima, and returns or throws budget violations.

## Playwright Helpers Module

**External seam**: `resetRenderStats`, `getRenderStats`, `expectRenderBudget`, and `createRenderBudgetFixture`.

**Interface**: Playwright users reset, read, and assert against the browser page.

**Implementation**: The Playwright helpers adapt Playwright `Page` to the internal browser-page stats store and budget evaluation module.
