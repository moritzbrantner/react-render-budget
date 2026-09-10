import type { Page } from "@playwright/test";

import type { RenderStatsSnapshot } from "../core/types";

export async function getRenderStats(page: Page): Promise<RenderStatsSnapshot> {
  return page.evaluate(() => ({
    profiler: window.__RENDER_STATS__ ?? {},
    components: window.__COMPONENT_RENDER_COUNTS__ ?? {},
  }));
}

export async function getRenderStatsWithKnownTargets(
  page: Page,
): Promise<RenderStatsSnapshot> {
  return page.evaluate(() => {
    const profiler = window.__RENDER_STATS__ ?? {};
    const components = window.__COMPONENT_RENDER_COUNTS__ ?? {};

    return {
      profiler,
      components,
      knownTargets: {
        profiler: [
          ...new Set([
            ...Object.keys(profiler),
            ...Object.keys(window.__RENDER_PROFILER_TARGETS__ ?? {}),
          ]),
        ],
        components: [
          ...new Set([
            ...Object.keys(components),
            ...Object.keys(window.__COMPONENT_RENDER_TARGETS__ ?? {}),
          ]),
        ],
      },
    };
  });
}
