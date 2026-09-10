import type { Page } from "@playwright/test";

import { assertRenderBudget } from "../core/budget";
import type {
  RenderBudget,
  RenderScenarioAction,
  RenderStatsSnapshot,
} from "../core/types";
import { measureRenderScenario } from "./measureRenderScenario";

export async function expectRenderBudgetAfter(
  page: Page,
  action: RenderScenarioAction,
  budget: RenderBudget,
): Promise<RenderStatsSnapshot> {
  const snapshot = await measureRenderScenario(page, action);

  assertRenderBudget(snapshot, budget);

  return snapshot;
}
