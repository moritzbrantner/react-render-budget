import { useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { RenderProfiler, withRenderCounter } from "react-render-budget/react";

interface CounterButtonProps {
  count: number;
  onIncrement: () => void;
}

function ExampleCounter({ count, onIncrement }: CounterButtonProps) {
  return (
    <button type="button" onClick={onIncrement}>
      Count {count}
    </button>
  );
}

const CountedExampleCounter = withRenderCounter(
  ExampleCounter,
  "ExampleCounter",
);

function ResetCounter({ count, onIncrement }: CounterButtonProps) {
  return (
    <button type="button" onClick={onIncrement}>
      Reset count {count}
    </button>
  );
}

const CountedResetCounter = withRenderCounter(ResetCounter, "ResetCounter");

function DisabledCounter({ count, onIncrement }: CounterButtonProps) {
  return (
    <button type="button" onClick={onIncrement}>
      Disabled count {count}
    </button>
  );
}

const CountedDisabledCounter = withRenderCounter(
  DisabledCounter,
  "DisabledCounter",
);

function NestedChild({ count, onIncrement }: CounterButtonProps) {
  return (
    <button type="button" onClick={onIncrement}>
      Nested count {count}
    </button>
  );
}

const CountedNestedChild = withRenderCounter(NestedChild, "NestedChild");

function RemountContent() {
  return <p>Profiled panel</p>;
}

const CountedRemountContent = withRenderCounter(
  RemountContent,
  "RemountContent",
);

function SharedItem({ value }: { value: number }) {
  return <li>Item {value}</li>;
}

const CountedSharedItem = withRenderCounter(SharedItem, "SharedItem");

function ItemSummary({ count }: { count: number }) {
  return <p>Total items {count}</p>;
}

const CountedItemSummary = withRenderCounter(ItemSummary, "ItemSummary");

function MetadataCounter({ count, onIncrement }: CounterButtonProps) {
  return (
    <button type="button" onClick={onIncrement}>
      Metadata count {count}
    </button>
  );
}

const CountedMetadataCounter = withRenderCounter(
  MetadataCounter,
  "MetadataCounter",
);

function BudgetCounter({ count, onIncrement }: CounterButtonProps) {
  return (
    <button type="button" onClick={onIncrement}>
      Budget count {count}
    </button>
  );
}

const CountedBudgetCounter = withRenderCounter(
  BudgetCounter,
  "BudgetCounter",
);

function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <RenderProfiler id="ExampleApp">
      <CountedExampleCounter
        count={count}
        onIncrement={() => setCount((current) => current + 1)}
      />
    </RenderProfiler>
  );
}

function ResetIsolationPage() {
  const [count, setCount] = useState(0);

  return (
    <RenderProfiler id="ResetIsolation">
      <CountedResetCounter
        count={count}
        onIncrement={() => setCount((current) => current + 1)}
      />
    </RenderProfiler>
  );
}

function DisabledProfilerPage() {
  const [count, setCount] = useState(0);

  return (
    <RenderProfiler id="DisabledPage" enabled={false}>
      <CountedDisabledCounter
        count={count}
        onIncrement={() => setCount((current) => current + 1)}
      />
    </RenderProfiler>
  );
}

function NestedProfilersPage() {
  const [count, setCount] = useState(0);

  return (
    <RenderProfiler id="NestedOuter">
      <RenderProfiler id="NestedInner">
        <CountedNestedChild
          count={count}
          onIncrement={() => setCount((current) => current + 1)}
        />
      </RenderProfiler>
    </RenderProfiler>
  );
}

function RemountProfilerPage() {
  const [shown, setShown] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShown((current) => !current)}>
        {shown ? "Hide panel" : "Show panel"}
      </button>
      {shown ? (
        <RenderProfiler id="RemountPanel">
          <CountedRemountContent />
        </RenderProfiler>
      ) : null}
    </>
  );
}

function MultipleCountersPage() {
  const [items, setItems] = useState([1, 2]);

  return (
    <RenderProfiler id="MultipleCounters">
      <button
        type="button"
        onClick={() => setItems((current) => [...current, current.length + 1])}
      >
        Add item
      </button>
      <CountedItemSummary count={items.length} />
      <ul>
        {items.map((item) => (
          <CountedSharedItem key={item} value={item} />
        ))}
      </ul>
    </RenderProfiler>
  );
}

function MetadataPage() {
  const [count, setCount] = useState(0);

  return (
    <RenderProfiler
      id="MetadataPage"
      metadata={{ scenario: "metadata", source: "playwright-page" }}
    >
      <CountedMetadataCounter
        count={count}
        onIncrement={() => setCount((current) => current + 1)}
      />
    </RenderProfiler>
  );
}

function BudgetFailurePage() {
  const [count, setCount] = useState(0);

  return (
    <RenderProfiler id="BudgetFailure">
      <CountedBudgetCounter
        count={count}
        onIncrement={() => setCount((current) => current + 1)}
      />
    </RenderProfiler>
  );
}

const pages: Record<string, () => ReactElement> = {
  "/": CounterPage,
  "/reset-isolation": ResetIsolationPage,
  "/disabled-profiler": DisabledProfilerPage,
  "/nested-profilers": NestedProfilersPage,
  "/remount-profiler": RemountProfilerPage,
  "/multiple-counters": MultipleCountersPage,
  "/metadata": MetadataPage,
  "/budget-failure": BudgetFailurePage,
};

export function App() {
  const Page = pages[window.location.pathname] ?? CounterPage;

  return <Page />;
}

createRoot(document.getElementById("root")!).render(<App />);
