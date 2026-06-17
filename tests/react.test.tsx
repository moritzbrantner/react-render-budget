import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { resetBrowserRenderStats } from "../src/core/globals";
import { RenderProfiler } from "../src/react/RenderProfiler";
import { withRenderCounter } from "../src/react/withRenderCounter";

function Counter({ label }: { label: string }) {
  return <button type="button">{label}</button>;
}

const CountedCounter = withRenderCounter(Counter, "Counter");

describe("React instrumentation", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    resetBrowserRenderStats();
  });

  it("records committed subtree renders and component function renders", async () => {
    resetBrowserRenderStats();
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <RenderProfiler id="CounterTree" metadata={{ test: "react" }}>
          <CountedCounter label="Click me" />
        </RenderProfiler>,
      );
    });

    expect(window.__RENDER_STATS__?.CounterTree?.commits).toBe(1);
    expect(window.__RENDER_STATS__?.CounterTree?.mounts).toBe(1);
    expect(window.__RENDER_STATS__?.CounterTree?.events[0]?.metadata).toEqual({
      test: "react",
    });
    expect(window.__COMPONENT_RENDER_COUNTS__?.Counter).toBe(1);

    await act(async () => {
      root.render(
        <RenderProfiler id="CounterTree" metadata={{ test: "react" }}>
          <CountedCounter label="Clicked" />
        </RenderProfiler>,
      );
    });

    expect(window.__RENDER_STATS__?.CounterTree?.commits).toBe(2);
    expect(window.__RENDER_STATS__?.CounterTree?.updates).toBe(1);
    expect(window.__COMPONENT_RENDER_COUNTS__?.Counter).toBe(2);

    await act(async () => {
      root.unmount();
    });
  });

  it("does not create profiler stats when disabled", async () => {
    resetBrowserRenderStats();
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <RenderProfiler id="DisabledTree" enabled={false}>
          <CountedCounter label="Disabled" />
        </RenderProfiler>,
      );
    });

    expect(window.__RENDER_STATS__?.DisabledTree).toBeUndefined();
    expect(window.__COMPONENT_RENDER_COUNTS__?.Counter).toBe(1);

    await act(async () => {
      root.unmount();
    });
  });
});
