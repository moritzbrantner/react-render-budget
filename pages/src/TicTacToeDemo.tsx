import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";

import { readRenderStatsSnapshot, resetBrowserPageStatsStore } from "../../src/core/browserPageStatsStore";
import { RenderProfiler, withRenderCounter } from "../../src/react";

import "./tic-tac-toe-demo.css";

type Player = "X" | "O";
type SquareValue = Player | null;
type RenderStatsSnapshot = ReturnType<typeof readRenderStatsSnapshot>;
type SnapshotKind = "startup" | "move";

interface TicTacToeCellProps {
  index: number;
  value: SquareValue;
  onSelect: (index: number) => void;
}

interface InstrumentedTicTacToeProps {
  onSnapshot: (kind: SnapshotKind, snapshot: RenderStatsSnapshot) => void;
}

const ticTacToeComponents = [
  "TicTacToeGame",
  "TicTacToeStatus",
  "TicTacToeBoard",
  "TicTacToeCell1",
  "TicTacToeCell2",
  "TicTacToeCell3",
  "TicTacToeCell4",
  "TicTacToeCell5",
  "TicTacToeCell6",
  "TicTacToeCell7",
  "TicTacToeCell8",
  "TicTacToeCell9",
] as const;

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function TicTacToeCell({ index, onSelect, value }: TicTacToeCellProps) {
  return (
    <button
      type="button"
      aria-label={`Cell ${index + 1}${value ? `: ${value}` : ""}`}
      data-filled={value === null ? "false" : "true"}
      onClick={() => onSelect(index)}
    >
      {value ?? ""}
    </button>
  );
}

const countedTicTacToeCells = Array.from({ length: 9 }, (_, index) =>
  memo(withRenderCounter(TicTacToeCell, `TicTacToeCell${index + 1}`)),
);

function TicTacToeBoard({
  onSelect,
  squares,
}: {
  onSelect: (index: number) => void;
  squares: SquareValue[];
}) {
  return (
    <div className="tic-tac-toe-board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((square, index) => {
        const CountedCell = countedTicTacToeCells[index];

        if (!CountedCell) {
          return null;
        }

        return (
          <CountedCell
            index={index}
            key={index}
            onSelect={onSelect}
            value={square}
          />
        );
      })}
    </div>
  );
}

const CountedTicTacToeBoard = withRenderCounter(
  TicTacToeBoard,
  "TicTacToeBoard",
);

function TicTacToeStatus({ squares }: { squares: SquareValue[] }) {
  const winner = calculateWinner(squares);

  if (winner) {
    return (
      <p className="tic-tac-toe-status" aria-live="polite">
        Winner: {winner}
      </p>
    );
  }

  if (squares.every((square) => square !== null)) {
    return (
      <p className="tic-tac-toe-status" aria-live="polite">
        Draw
      </p>
    );
  }

  return (
    <p className="tic-tac-toe-status" aria-live="polite">
      Next player: {getNextPlayer(squares)}
    </p>
  );
}

const CountedTicTacToeStatus = withRenderCounter(
  TicTacToeStatus,
  "TicTacToeStatus",
);

function TicTacToeGame({
  onSelect,
  squares,
}: {
  onSelect: (index: number) => void;
  squares: SquareValue[];
}) {
  return (
    <RenderProfiler id="TicTacToeExample">
      <CountedTicTacToeStatus squares={squares} />
      <CountedTicTacToeBoard onSelect={onSelect} squares={squares} />
    </RenderProfiler>
  );
}

const CountedTicTacToeGame = withRenderCounter(
  TicTacToeGame,
  "TicTacToeGame",
);

const InstrumentedTicTacToe = memo(function InstrumentedTicTacToe({
  onSnapshot,
}: InstrumentedTicTacToeProps) {
  const [squares, setSquares] = useState<SquareValue[]>(() =>
    Array<SquareValue>(9).fill(null),
  );
  const squaresRef = useRef(squares);
  const lastReportedSquaresRef = useRef<SquareValue[] | null>(null);

  const handleSelect = useCallback((index: number) => {
    const current = squaresRef.current;

    if (
      index < 0 ||
      index >= current.length ||
      current[index] !== null ||
      calculateWinner(current)
    ) {
      return;
    }

    const next = current.slice();
    next[index] = getNextPlayer(current);
    squaresRef.current = next;
    setSquares(next);
  }, []);

  useEffect(() => {
    if (lastReportedSquaresRef.current === squares) {
      return;
    }

    const kind: SnapshotKind =
      lastReportedSquaresRef.current === null ? "startup" : "move";
    lastReportedSquaresRef.current = squares;
    onSnapshot(kind, readRenderStatsSnapshot());
    resetBrowserPageStatsStore();
  }, [onSnapshot, squares]);

  return <CountedTicTacToeGame onSelect={handleSelect} squares={squares} />;
});

function calculateWinner(squares: SquareValue[]): Player | null {
  for (const [a, b, c] of winningLines) {
    const value = squares[a];

    if (value && value === squares[b] && value === squares[c]) {
      return value;
    }
  }

  return null;
}

function getNextPlayer(squares: SquareValue[]): Player {
  return squares.filter(Boolean).length % 2 === 0 ? "X" : "O";
}

function getComponentCount(
  snapshot: RenderStatsSnapshot | null,
  component: (typeof ticTacToeComponents)[number],
): number | string {
  if (!snapshot) {
    return "—";
  }

  return snapshot.components[component] ?? 0;
}

function TicTacToeDemo(): ReactElement {
  const [session, setSession] = useState(0);
  const [startupSnapshot, setStartupSnapshot] =
    useState<RenderStatsSnapshot | null>(null);
  const [moveSnapshot, setMoveSnapshot] =
    useState<RenderStatsSnapshot | null>(null);

  const handleSnapshot = useCallback(
    (kind: SnapshotKind, snapshot: RenderStatsSnapshot) => {
      if (kind === "startup") {
        setStartupSnapshot(snapshot);
        setMoveSnapshot(null);
        return;
      }

      setMoveSnapshot(snapshot);
    },
    [],
  );

  const handleRestart = useCallback(() => {
    resetBrowserPageStatsStore();
    setStartupSnapshot(null);
    setMoveSnapshot(null);
    setSession((current) => current + 1);
  }, []);

  return (
    <div className="tic-tac-toe-example">
      <div className="tic-tac-toe-live">
        <div className="tic-tac-toe-live__toolbar">
          <span>Interactive instrumented fixture</span>
          <button
            className="button tic-tac-toe-live__reset"
            type="button"
            onClick={handleRestart}
          >
            Restart
          </button>
        </div>
        <InstrumentedTicTacToe
          key={session}
          onSnapshot={handleSnapshot}
        />
      </div>

      <div className="render-comparison" aria-label="Live Tic Tac Toe render counts">
        <div className="render-comparison__header">
          <span>Component</span>
          <span>Startup</span>
          <span>Last move</span>
        </div>
        {ticTacToeComponents.map((component) => (
          <div className="render-comparison__row" key={component}>
            <code>{component}</code>
            <strong>{getComponentCount(startupSnapshot, component)}</strong>
            <strong>{getComponentCount(moveSnapshot, component)}</strong>
          </div>
        ))}
      </div>

      <pre className="code-panel code-panel--compact" tabIndex={0}>
        <code>{`await page.goto("/tic-tac-toe");
expect((await getRenderStats(page)).components.TicTacToeCell9).toBe(1);

await resetRenderStats(page);
await page.getByRole("button", { name: "Cell 1" }).click();

const stats = await getRenderStats(page);
expect(stats.components.TicTacToeCell1).toBe(1);
expect(stats.components.TicTacToeCell2).toBeUndefined();`}</code>
      </pre>
    </div>
  );
}

export { TicTacToeDemo };
