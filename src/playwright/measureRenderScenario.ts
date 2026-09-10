import type { Page } from "@playwright/test";

import { diffRenderStats } from "../core/renderStatsDiff";
import type {
  RenderScenarioAction,
  RenderStatsSnapshot,
} from "../core/types";
import { getRenderStatsWithKnownTargets } from "./getRenderStats";

export async function measureRenderScenario(
  page: Page,
  action: RenderScenarioAction,
): Promise<RenderStatsSnapshot> {
  const before = await getRenderStatsWithKnownTargets(page);

  await action();

  const after = await getRenderStatsWithKnownTargets(page);

  return diffRenderStats(before, after);
}
