import { act, createContext, useContext, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { resetBrowserPageStatsStore } from "../src/core/browserPageStatsStore";
import { RenderProfiler } from "../src/react/RenderProfiler";
import { useRenderCounter } from "../src/react/useRenderCounter";
import { withRenderCounter } from "../src/react/withRenderCounter";

function Counter({ label }: { label: string }) {
  return <button type="button">{label}</button>;
}

const CountedCounter = withRenderCounter(Counter, "Counter");

describe("React instrumentation", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    resetBrowserPageStatsStore();
  });

  it("records committed subtree renders and component function renders", async () => {
    resetBrowserPageStatsStore();
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
    resetBrowserPageStatsStore();
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

  it("counts self-triggered renders with useRenderCounter that withRenderCounter misses", async () => {
    resetBrowserPageStatsStore();
    const TickContext = createContext(0);
    let setTick: (tick: number) => void = () => undefined;

    function Ticker({ children }: { children: ReactNode }) {
      const [tick, updateTick] = useState(0);
      setTick = updateTick;
      return <TickContext.Provider value={tick}>{children}</TickContext.Provider>;
    }

    function HookCounted() {
      useRenderCounter("HookCounted");
      return <span>{useContext(TickContext)}</span>;
    }

    function ContextReader() {
      return <span>{useContext(TickContext)}</span>;
    }
    const WrapperCounted = withRenderCounter(ContextReader, "WrapperCounted");

    // A static element: the Ticker's state change re-renders context consumers, not this parent.
    const tree = (
      <>
        <HookCounted />
        <WrapperCounted />
      </>
    );

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Ticker>{tree}</Ticker>);
    });
    await act(async () => setTick(1));
    await act(async () => setTick(2));

    expect(window.__COMPONENT_RENDER_COUNTS__?.HookCounted).toBe(3);
    // The wrapper only rendered on mount; the context updates re-ran ContextReader directly.
    expect(window.__COMPONENT_RENDER_COUNTS__?.WrapperCounted).toBe(1);
    expect(container.textContent).toBe("22");

    await act(async () => {
      root.unmount();
    });
  });
});
