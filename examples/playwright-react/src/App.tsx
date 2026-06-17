import { useState } from "react";
import { createRoot } from "react-dom/client";
import { RenderProfiler, withRenderCounter } from "react-render-budget/react";

function ExampleCounter({ count, onIncrement }: {
  count: number;
  onIncrement: () => void;
}) {
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

export function App() {
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

createRoot(document.getElementById("root")!).render(<App />);
