import type {
  ComponentRenderCounts,
  KnownRenderTargets,
  ProfilerRenderEvent,
  ProfilerRenderStats,
  RenderStatsSnapshot,
} from "./types";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function createEmptyKnownRenderTargets(): KnownRenderTargets {
  return {
    profiler: [],
    components: [],
  };
}

function getKnownRenderTargetRegistry() {
  if (!hasWindow()) {
    return undefined;
  }

  window.reactRenderBudgetKnownTargets ??= {
    profiler: {},
    components: {},
  };

  return window.reactRenderBudgetKnownTargets;
}

function readKnownRenderTargets(): KnownRenderTargets {
  const registry = getKnownRenderTargetRegistry();

  if (!registry) {
    return createEmptyKnownRenderTargets();
  }

  return {
    profiler: Object.keys(registry.profiler),
    components: Object.keys(registry.components),
  };
}

function registerProfilerTarget(id: string): void {
  const registry = getKnownRenderTargetRegistry();

  if (registry) {
    registry.profiler[id] = true;
  }
}

function registerComponentTarget(name: string): void {
  const registry = getKnownRenderTargetRegistry();

  if (registry) {
    registry.components[name] = true;
  }
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
    knownTargets: createEmptyKnownRenderTargets(),
  };
}

export function getBrowserPageStatsStore(): RenderStatsSnapshot | undefined {
  if (!hasWindow()) {
    return undefined;
  }

  window.__RENDER_STATS__ ??= createEmptyRenderStats();
  window.__COMPONENT_RENDER_COUNTS__ ??= createEmptyComponentRenderCounts();
  getKnownRenderTargetRegistry();

  return {
    profiler: window.__RENDER_STATS__,
    components: window.__COMPONENT_RENDER_COUNTS__,
    knownTargets: readKnownRenderTargets(),
  };
}

export function readRenderStatsSnapshot(): RenderStatsSnapshot {
  if (!hasWindow()) {
    return createEmptyRenderStatsSnapshot();
  }

  const profiler = Object.fromEntries(
    Object.entries(window.__RENDER_STATS__ ?? {}).map(([id, stats]) => [
      id,
      {
        ...stats,
        events: stats.events.map((event) => ({ ...event })),
      },
    ]),
  );

  return {
    profiler,
    components: { ...(window.__COMPONENT_RENDER_COUNTS__ ?? {}) },
    knownTargets: readKnownRenderTargets(),
  };
}

export function resetBrowserPageStatsStore(): void {
  if (!hasWindow()) {
    return;
  }

  window.__RENDER_STATS__ = createEmptyRenderStats();
  window.__COMPONENT_RENDER_COUNTS__ = createEmptyComponentRenderCounts();
  getKnownRenderTargetRegistry();
}

export function recordProfilerRender(event: ProfilerRenderEvent): void {
  registerProfilerTarget(event.id);
  const store = getBrowserPageStatsStore();

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
  registerComponentTarget(name);
  const store = getBrowserPageStatsStore();

  if (!store) {
    return;
  }

  store.components[name] = (store.components[name] ?? 0) + 1;
}
