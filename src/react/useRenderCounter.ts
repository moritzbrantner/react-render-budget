import { incrementComponentRenderCount } from "../core/browserPageStatsStore";

/**
 * Records one component render for `name` each time the calling component function runs.
 *
 * Unlike `withRenderCounter`, which counts calls of its wrapper, the hook also counts renders
 * that the component triggers itself through its own state, context, or external stores,
 * because those re-run the component without re-running a wrapper around it.
 */
export function useRenderCounter(name: string): void {
  incrementComponentRenderCount(name);
}
