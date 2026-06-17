import type { Page } from "@playwright/test";

import type { RenderStatsSnapshot } from "../core/types";

export async function getRenderStats(page: Page): Promise<RenderStatsSnapshot> {
  return page.evaluate(() => ({
    profiler: window.__RENDER_STATS__ ?? {},
    components: window.__COMPONENT_RENDER_COUNTS__ ?? {},
  }));
}
