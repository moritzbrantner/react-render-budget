import type { Page } from "@playwright/test";

import { assertRenderBudget } from "../core/budget";
import type { RenderBudget, RenderStatsSnapshot } from "../core/types";
import { getRenderStatsWithKnownTargets } from "./getRenderStats";

export async function expectRenderBudget(
  page: Page,
  budget: RenderBudget,
): Promise<RenderStatsSnapshot> {
  const snapshot = await getRenderStatsWithKnownTargets(page);

  assertRenderBudget(snapshot, budget);

  return {
    profiler: snapshot.profiler,
    components: snapshot.components,
  };
}
