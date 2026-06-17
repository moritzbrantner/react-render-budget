import type { Page } from "@playwright/test";

export async function resetRenderStats(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__RENDER_STATS__ = {};
    window.__COMPONENT_RENDER_COUNTS__ = {};
  });
}
