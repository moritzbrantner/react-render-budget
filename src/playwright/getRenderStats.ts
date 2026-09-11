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
    const knownTargets = window.reactRenderBudgetKnownTargets;
    window.reactRenderBudgetDocumentId ??= crypto.randomUUID();

    return {
      profiler,
      components,
      knownTargets: {
        profiler: [
          ...new Set([
            ...Object.keys(profiler),
            ...Object.keys(knownTargets?.profiler ?? {}),
          ]),
        ],
        components: [
          ...new Set([
            ...Object.keys(components),
            ...Object.keys(knownTargets?.components ?? {}),
          ]),
        ],
      },
      documentId: window.reactRenderBudgetDocumentId,
    };
  });
}
