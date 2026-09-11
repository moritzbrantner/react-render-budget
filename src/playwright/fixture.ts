import type { Page, TestFixture } from "@playwright/test";

import type { RenderBudgetFixture } from "../core/types";
import { expectRenderBudget } from "./expectRenderBudget";
import { expectRenderBudgetAfter } from "./expectRenderBudgetAfter";
import { getRenderStats } from "./getRenderStats";
import { measureRenderScenario } from "./measureRenderScenario";
import { resetRenderStats } from "./resetRenderStats";

export function createRenderBudgetFixture(): TestFixture<
  RenderBudgetFixture,
  { page: Page }
> {
  return async ({ page }, use) => {
    await use({
      reset: () => resetRenderStats(page),
      get: () => getRenderStats(page),
      expectBudget: (budget) => expectRenderBudget(page, budget),
      measure: (action) => measureRenderScenario(page, action),
      expectAfter: (action, budget) =>
        expectRenderBudgetAfter(page, action, budget),
    });
  };
}
