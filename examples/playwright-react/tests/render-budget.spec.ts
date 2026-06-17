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
