import type { Page } from "@playwright/test";

import { assertRenderBudget } from "../core/budget";
import type { RenderBudget, RenderStatsSnapshot } from "../core/types";
import { getRenderStats } from "./getRenderStats";

export async function expectRenderBudget(
  page: Page,
  budget: RenderBudget,
): Promise<RenderStatsSnapshot> {
  const snapshot = await getRenderStats(page);

  assertRenderBudget(snapshot, budget);

  return snapshot;
}
