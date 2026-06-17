# react-render-budget

Measure React render counts and render budgets in Playwright tests.

`react-render-budget` gives you small, explicit instrumentation tools for tests:

- `RenderProfiler` records React Profiler commits for a subtree.
- `withRenderCounter` records component function render calls.
- Playwright helpers reset, read, and assert render budgets from the browser page.

There is no global React patching, monkey-patching, automatic instrumentation, framework coupling, or hard-coded component naming. Apps only record stats where they explicitly render or wrap these helpers.

## Installation

```sh
npm install --save-dev react-render-budget
```

Install the peer dependencies you use in the consuming project:

```sh
npm install react
npm install --save-dev @playwright/test
```

`react` is a peer dependency. `@playwright/test` is an optional peer dependency, so projects that only import `react-render-budget/react` do not need Playwright installed.

## Basic Usage

Wrap a subtree with `RenderProfiler`:

```tsx
import { RenderProfiler } from "react-render-budget/react";

export function TestApp() {
  return (
    <RenderProfiler id="TimelineEditor">
      <TimelineEditor />
    </RenderProfiler>
  );
}
```

`RenderProfiler` accepts:

- `id: string`
- `children: React.ReactNode`
- `enabled?: boolean`
- `metadata?: Record<string, unknown>`

It records committed React Profiler events on `window.__RENDER_STATS__`.

## Component Render Counter

Use `withRenderCounter` when you need exact component function render calls:

```tsx
import { withRenderCounter } from "react-render-budget/react";

const CountedTimelineItem = withRenderCounter(TimelineItem, "TimelineItem");
```

It increments `window.__COMPONENT_RENDER_COUNTS__[name]` each time the wrapped component function renders.

`RenderProfiler` and `withRenderCounter` measure different things:

- `RenderProfiler` measures committed subtree renders through React's built-in Profiler.
- `withRenderCounter` measures component function render calls, including calls that may not map one-to-one to committed subtree updates.

## Playwright Helpers

```ts
import {
  expectRenderBudget,
  getRenderStats,
  resetRenderStats,
} from "react-render-budget/playwright";

test("selecting a clip stays within render budget", async ({ page }) => {
  await page.goto("/timeline");

  await resetRenderStats(page);
  await page.getByText("Clip 1").click();

  const stats = await getRenderStats(page);
  console.log(stats);

  await expectRenderBudget(page, {
    profiler: {
      TimelineEditor: {
        commits: { max: 3 },
        updates: { max: 2 },
        totalActualDuration: { max: 16 },
      },
    },
    components: {
      TimelineItem: { max: 10 },
      LayerRow: { max: 5 },
    },
  });
});
```

Component budgets also support numeric shorthand:

```ts
await expectRenderBudget(page, {
  components: {
    TimelineItem: 10,
  },
});
```

Reset stats immediately before the scenario being measured. Initial page load and mount work often has different characteristics from the interaction you want to budget.

## Playwright Fixture

```ts
import { test as base, expect } from "@playwright/experimental-ct-react";
import type { RenderBudgetFixture } from "react-render-budget";
import { createRenderBudgetFixture } from "react-render-budget/playwright";

export const test = base.extend<{
  renderStats: RenderBudgetFixture;
}>({
  renderStats: createRenderBudgetFixture(),
});

export { expect };
```

Then use it in a component or browser test:

```tsx
test("selecting a clip stays within render budget", async ({
  mount,
  page,
  renderStats,
}) => {
  await mount(
    <RenderProfiler id="TimelineEditor">
      <TimelineEditor />
    </RenderProfiler>,
  );

  await renderStats.reset();
  await page.getByText("Clip 1").click();

  await renderStats.expectBudget({
    profiler: {
      TimelineEditor: {
        updates: { max: 2 },
      },
    },
  });
});
```

The fixture works with Playwright component tests and normal browser/e2e tests, as long as the app imports and renders the React instrumentation.

## Metrics

Profiler stats are stored by id:

- `commits`: total committed Profiler callbacks.
- `mounts`: commits where the Profiler phase is `mount`.
- `updates`: commits where the Profiler phase is `update`.
- `nestedUpdates`: commits where the Profiler phase is `nested-update`.
- `totalActualDuration`: sum of React Profiler `actualDuration`.
- `totalBaseDuration`: sum of React Profiler `baseDuration`.
- `events`: raw Profiler events with `id`, `phase`, `actualDuration`, `baseDuration`, `startTime`, `commitTime`, and optional `metadata`.

Component counts are stored by name:

- `components[name]`: number of times the wrapped component function rendered.

## Caveats

React StrictMode intentionally double-invokes some render paths in development. Keep that in mind when comparing local component render counts with production builds.

Concurrent rendering can start work that is later abandoned. `RenderProfiler` records committed Profiler events. `withRenderCounter` records component function calls, including calls that may not commit.

Use upper-bound budgets, not exact render counts. Render counts can change across React versions, development modes, and harmless implementation details.

## API Reference

```ts
// react-render-budget/react
export { RenderProfiler } from "react-render-budget/react";
export { withRenderCounter } from "react-render-budget/react";

// react-render-budget/playwright
export { resetRenderStats } from "react-render-budget/playwright";
export { getRenderStats } from "react-render-budget/playwright";
export { expectRenderBudget } from "react-render-budget/playwright";
export { createRenderBudgetFixture } from "react-render-budget/playwright";

// react-render-budget
export type {
  RenderBudget,
  RenderStatsSnapshot,
  ProfilerRenderStats,
  ComponentRenderCounts,
  RenderBudgetFixture,
} from "react-render-budget";
```

## Example

See `examples/playwright-react` for a tiny Vite React app with a Playwright test.

From the package root:

```sh
npm install
npm run build
cd examples/playwright-react
npm install
npm test
```

## Publishing Checklist

1. Run tests
2. Run typecheck
3. Run build
4. Run npm pack --dry-run
5. Inspect package contents
6. Publish with npm publish --access public, or configure trusted publishing
