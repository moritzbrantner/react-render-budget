import { expect, test } from "@playwright/test";
import {
  expectRenderBudget,
  getRenderStats,
  resetRenderStats,
} from "react-render-budget/playwright";

test("counter interaction stays within render budget", async ({ page }) => {
  await page.goto("/");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Count 0" }).click();

  const stats = await getRenderStats(page);
  expect(stats.components.ExampleCounter).toBe(1);
  expect(stats.profiler.ExampleApp?.updates).toBe(1);

  await expectRenderBudget(page, {
    profiler: {
      ExampleApp: {
        commits: { max: 1 },
        updates: { max: 1 },
      },
    },
    components: {
      ExampleCounter: 1,
    },
  });
});

test("reset clears stats without resetting app state", async ({ page }) => {
  await page.goto("/reset-isolation");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Reset count 0" }).click();

  expect((await getRenderStats(page)).components.ResetCounter).toBe(1);

  await resetRenderStats(page);
  expect(await getRenderStats(page)).toEqual({
    profiler: {},
    components: {},
  });

  await page.getByRole("button", { name: "Reset count 1" }).click();

  const stats = await getRenderStats(page);
  expect(stats.components.ResetCounter).toBe(1);
  expect(stats.profiler.ResetIsolation?.updates).toBe(1);
});

test("disabled profiler leaves component counts without profiler stats", async ({
  page,
}) => {
  await page.goto("/disabled-profiler");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Disabled count 0" }).click();

  const stats = await getRenderStats(page);
  expect(stats.profiler.DisabledPage).toBeUndefined();
  expect(stats.components.DisabledCounter).toBe(1);
});

test("nested profilers record independent updates", async ({ page }) => {
  await page.goto("/nested-profilers");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Nested count 0" }).click();

  const stats = await getRenderStats(page);
  expect(stats.profiler.NestedOuter?.updates).toBe(1);
  expect(stats.profiler.NestedInner?.updates).toBe(1);
  expect(stats.components.NestedChild).toBe(1);

  await expectRenderBudget(page, {
    profiler: {
      NestedOuter: { updates: { max: 1 } },
      NestedInner: { updates: { max: 1 } },
    },
    components: {
      NestedChild: 1,
    },
  });
});

test("remount after reset is recorded as a mount", async ({ page }) => {
  await page.goto("/remount-profiler");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Hide panel" }).click();
  expect(await getRenderStats(page)).toEqual({
    profiler: {},
    components: {},
  });

  await page.getByRole("button", { name: "Show panel" }).click();

  const stats = await getRenderStats(page);
  expect(stats.profiler.RemountPanel?.mounts).toBe(1);
  expect(stats.profiler.RemountPanel?.updates).toBe(0);
  expect(stats.components.RemountContent).toBe(1);
});

test("same component counter name aggregates across instances", async ({
  page,
}) => {
  await page.goto("/multiple-counters");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Add item" }).click();

  const stats = await getRenderStats(page);
  expect(stats.components.SharedItem).toBe(3);
  expect(stats.components.ItemSummary).toBe(1);
  expect(stats.profiler.MultipleCounters?.updates).toBe(1);
});

test("profiler metadata survives through Playwright snapshots", async ({
  page,
}) => {
  await page.goto("/metadata");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Metadata count 0" }).click();

  const stats = await getRenderStats(page);
  expect(stats.profiler.MetadataPage?.events[0]?.metadata).toEqual({
    scenario: "metadata",
    source: "playwright-page",
  });
});

test("budget failures are observable through the Playwright helper", async ({
  page,
}) => {
  await page.goto("/budget-failure");

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Budget count 0" }).click();

  let message = "";

  try {
    await expectRenderBudget(page, {
      profiler: {
        BudgetFailure: { updates: { max: 0 } },
      },
      components: {
        BudgetCounter: 0,
      },
    });
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }

  expect(message).toContain(
    'Profiler "BudgetFailure" metric "updates" exceeded budget: actual 1, expected max 0.',
  );
  expect(message).toContain(
    'Component "BudgetCounter" metric "renders" exceeded budget: actual 1, expected max 0.',
  );
});

test("tic tac toe startup and first move render only the expected components", async ({
  page,
}) => {
  await page.goto("/tic-tac-toe");

  const startupStats = await getRenderStats(page);
  expect(startupStats.profiler.TicTacToeExample?.mounts).toBe(1);
  expect(startupStats.profiler.TicTacToeExample?.updates).toBe(0);
  expect(startupStats.components.TicTacToeGame).toBe(1);
  expect(startupStats.components.TicTacToeStatus).toBe(1);
  expect(startupStats.components.TicTacToeBoard).toBe(1);

  for (let index = 1; index <= 9; index += 1) {
    expect(startupStats.components[`TicTacToeCell${index}`]).toBe(1);
  }

  await resetRenderStats(page);
  await page.getByRole("button", { name: "Cell 1" }).click();

  const moveStats = await getRenderStats(page);
  expect(moveStats.profiler.TicTacToeExample?.updates).toBe(1);
  expect(moveStats.components.TicTacToeGame).toBe(1);
  expect(moveStats.components.TicTacToeStatus).toBe(1);
  expect(moveStats.components.TicTacToeBoard).toBe(1);
  expect(moveStats.components.TicTacToeCell1).toBe(1);

  for (let index = 2; index <= 9; index += 1) {
    expect(moveStats.components[`TicTacToeCell${index}`]).toBeUndefined();
  }

  await expectRenderBudget(page, {
    profiler: {
      TicTacToeExample: {
        updates: { max: 1 },
      },
    },
    components: {
      TicTacToeGame: 1,
      TicTacToeStatus: 1,
      TicTacToeBoard: 1,
      TicTacToeCell1: 1,
    },
  });
});
