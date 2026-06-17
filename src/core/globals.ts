import type {
  ComponentRenderCounts,
  ProfilerRenderEvent,
  ProfilerRenderStats,
  RenderStatsSnapshot,
} from "./types";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function createEmptyRenderStats(): Record<string, ProfilerRenderStats> {
  return {};
}

export function createEmptyComponentRenderCounts(): ComponentRenderCounts {
  return {};
}

export function createEmptyRenderStatsSnapshot(): RenderStatsSnapshot {
  return {
    profiler: createEmptyRenderStats(),
    components: createEmptyComponentRenderCounts(),
  };
}

export function getRenderStatsStore(): RenderStatsSnapshot | undefined {
  if (!hasWindow()) {
    return undefined;
  }

  window.__RENDER_STATS__ ??= createEmptyRenderStats();
  window.__COMPONENT_RENDER_COUNTS__ ??= createEmptyComponentRenderCounts();

  return {
    profiler: window.__RENDER_STATS__,
    components: window.__COMPONENT_RENDER_COUNTS__,
  };
}

export function readRenderStatsSnapshot(): RenderStatsSnapshot {
  if (!hasWindow()) {
    return createEmptyRenderStatsSnapshot();
  }

  return {
    profiler: window.__RENDER_STATS__ ?? createEmptyRenderStats(),
    components:
      window.__COMPONENT_RENDER_COUNTS__ ?? createEmptyComponentRenderCounts(),
  };
}

export function resetBrowserRenderStats(): void {
  if (!hasWindow()) {
    return;
  }

  window.__RENDER_STATS__ = createEmptyRenderStats();
  window.__COMPONENT_RENDER_COUNTS__ = createEmptyComponentRenderCounts();
}

export function recordProfilerRender(event: ProfilerRenderEvent): void {
  const store = getRenderStatsStore();

  if (!store) {
    return;
  }

  const current =
    store.profiler[event.id] ??
    ({
      id: event.id,
      commits: 0,
      mounts: 0,
      updates: 0,
      nestedUpdates: 0,
      totalActualDuration: 0,
      totalBaseDuration: 0,
      events: [],
    } satisfies ProfilerRenderStats);

  current.commits += 1;
  current.totalActualDuration += event.actualDuration;
  current.totalBaseDuration += event.baseDuration;
  current.events.push(event);

  if (event.phase === "mount") {
    current.mounts += 1;
  } else if (event.phase === "nested-update") {
    current.nestedUpdates += 1;
  } else {
    current.updates += 1;
  }

  store.profiler[event.id] = current;
}

export function incrementComponentRenderCount(name: string): void {
  const store = getRenderStatsStore();

  if (!store) {
    return;
  }

  store.components[name] = (store.components[name] ?? 0) + 1;
}
