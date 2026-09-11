import type {
  KnownRenderTargets,
  ProfilerRenderStats,
  RenderStatsSnapshot,
} from "./types";

function uniqueIds(...groups: string[][]): string[] {
  return [...new Set(groups.flat())];
}

function knownProfilerIds(snapshot: RenderStatsSnapshot): string[] {
  return uniqueIds(
    Object.keys(snapshot.profiler),
    snapshot.knownTargets?.profiler ?? [],
  );
}

function knownComponentIds(snapshot: RenderStatsSnapshot): string[] {
  return uniqueIds(
    Object.keys(snapshot.components),
    snapshot.knownTargets?.components ?? [],
  );
}

function createEmptyProfilerStats(id: string): ProfilerRenderStats {
  return {
    id,
    commits: 0,
    mounts: 0,
    updates: 0,
    nestedUpdates: 0,
    totalActualDuration: 0,
    totalBaseDuration: 0,
    events: [],
  };
}

function assertSameDocument(
  before: RenderStatsSnapshot,
  after: RenderStatsSnapshot,
): void {
  if (
    before.documentId !== undefined &&
    after.documentId !== undefined &&
    before.documentId !== after.documentId
  ) {
    throw new Error(
      "Cannot diff render stats: the browser document changed during the measurement window.",
    );
  }
}

function subtractMonotonic(
  target: string,
  metric: string,
  before: number,
  after: number,
): number {
  const difference = after - before;

  if (difference < 0) {
    throw new Error(
      `Cannot diff render stats: ${target} metric "${metric}" decreased from ${before} to ${after}.`,
    );
  }

  return difference;
}

function diffProfilerStats(
  id: string,
  before: ProfilerRenderStats | undefined,
  after: ProfilerRenderStats | undefined,
): ProfilerRenderStats | undefined {
  const beforeStats = before ?? createEmptyProfilerStats(id);
  const afterStats = after ?? createEmptyProfilerStats(id);
  const commits = subtractMonotonic(
    `Profiler "${id}"`,
    "commits",
    beforeStats.commits,
    afterStats.commits,
  );
  const mounts = subtractMonotonic(
    `Profiler "${id}"`,
    "mounts",
    beforeStats.mounts,
    afterStats.mounts,
  );
  const updates = subtractMonotonic(
    `Profiler "${id}"`,
    "updates",
    beforeStats.updates,
    afterStats.updates,
  );
  const nestedUpdates = subtractMonotonic(
    `Profiler "${id}"`,
    "nestedUpdates",
    beforeStats.nestedUpdates,
    afterStats.nestedUpdates,
  );
  const totalActualDuration = subtractMonotonic(
    `Profiler "${id}"`,
    "totalActualDuration",
    beforeStats.totalActualDuration,
    afterStats.totalActualDuration,
  );
  const totalBaseDuration = subtractMonotonic(
    `Profiler "${id}"`,
    "totalBaseDuration",
    beforeStats.totalBaseDuration,
    afterStats.totalBaseDuration,
  );

  if (afterStats.events.length < beforeStats.events.length) {
    throw new Error(
      `Cannot diff render stats: Profiler "${id}" event count decreased from ${beforeStats.events.length} to ${afterStats.events.length}.`,
    );
  }

  const events = afterStats.events
    .slice(beforeStats.events.length)
    .map((event) => Object.assign({}, event));

  if (
    commits === 0 &&
    mounts === 0 &&
    updates === 0 &&
    nestedUpdates === 0 &&
    totalActualDuration === 0 &&
    totalBaseDuration === 0 &&
    events.length === 0
  ) {
    return undefined;
  }

  return {
    id,
    commits,
    mounts,
    updates,
    nestedUpdates,
    totalActualDuration,
    totalBaseDuration,
    events,
  };
}

export function diffRenderStats(
  before: RenderStatsSnapshot,
  after: RenderStatsSnapshot,
): RenderStatsSnapshot {
  assertSameDocument(before, after);

  const knownTargets: KnownRenderTargets = {
    profiler: uniqueIds(knownProfilerIds(before), knownProfilerIds(after)),
    components: uniqueIds(
      knownComponentIds(before),
      knownComponentIds(after),
    ),
  };
  const profiler: RenderStatsSnapshot["profiler"] = {};
  const components: RenderStatsSnapshot["components"] = {};

  for (const id of knownTargets.profiler) {
    const difference = diffProfilerStats(
      id,
      before.profiler[id],
      after.profiler[id],
    );

    if (difference) {
      profiler[id] = difference;
    }
  }

  for (const id of knownTargets.components) {
    const beforeCount = before.components[id] ?? 0;
    const afterCount = after.components[id] ?? 0;
    const difference = subtractMonotonic(
      `Component "${id}"`,
      "renders",
      beforeCount,
      afterCount,
    );

    if (difference > 0) {
      components[id] = difference;
    }
  }

  return {
    profiler,
    components,
    knownTargets,
  };
}
