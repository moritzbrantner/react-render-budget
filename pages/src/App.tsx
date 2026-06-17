import {
  Activity,
  BarChart3,
  Box,
  Code2,
  ExternalLink,
  Gauge,
  GitBranch,
  PackageCheck,
  PlayCircle,
  ShieldCheck,
  TestTube2,
  Timer,
} from "lucide-react";

import projectData from "./generated/project-metrics.json";

const metricCards = [
  {
    label: "API entrypoints",
    value: projectData.metrics.apiEntrypoints,
    detail: projectData.exportedEntrypoints.join(", "),
    icon: Box,
  },
  {
    label: "Unit tests",
    value: projectData.metrics.unitTests,
    detail: `${projectData.metrics.unitTestFiles} Vitest files`,
    icon: TestTube2,
  },
  {
    label: "Browser scenarios",
    value: projectData.metrics.e2eTests,
    detail: `${projectData.metrics.e2eSpecFiles} Playwright spec`,
    icon: PlayCircle,
  },
  {
    label: "Benchmark workloads",
    value: projectData.metrics.benchmarkWorkloads,
    detail: "Vitest bench artifacts",
    icon: Gauge,
  },
];

const apiSurfaces = [
  {
    title: "React instrumentation",
    importPath: "react-render-budget/react",
    summary:
      "RenderProfiler records committed React Profiler events, while withRenderCounter tracks component function render calls.",
    metric: "Profiler + component counters",
  },
  {
    title: "Playwright helpers",
    importPath: "react-render-budget/playwright",
    summary:
      "Browser tests can reset, read, and assert render budgets directly from the Playwright page object.",
    metric: "Reset, snapshot, budget assertion",
  },
  {
    title: "Typed budget model",
    importPath: "react-render-budget",
    summary:
      "The root export keeps shared TypeScript types for snapshots, budgets, violations, and fixtures.",
    metric: "Strict package API",
  },
];

const workflowNodes = [
  {
    title: "Validate",
    detail: "typecheck, build, unit tests, pack check, Playwright e2e",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    title: "Performance",
    detail: "scheduled and manual benchmark artifacts",
    icon: BarChart3,
    tone: "blue",
  },
  {
    title: "Deploy Pages",
    detail: "publishes this Vite app through the reusable Pages workflow",
    icon: GitBranch,
    tone: "orange",
  },
];

const benchmarkRows = [
  {
    label: "Budget evaluator",
    description: "Evaluates 100 profiler budgets and 100 component render budgets.",
    source: "benchmarks/render-budget.bench.ts",
  },
  {
    label: "Stats recorder",
    description: "Records 100 profiler events into the browser render stats store.",
    source: "benchmarks/render-budget.bench.ts",
  },
];

function App() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">React render observability for tests</p>
            <h1 id="hero-title">react-render-budget</h1>
            <p className="hero__lede">{projectData.description}</p>
            <div className="hero__actions" aria-label="Project links">
              <a className="button button--primary" href={projectData.repositoryUrl}>
                <GitBranch aria-hidden="true" />
                Repository
              </a>
              <a className="button" href={`${projectData.repositoryUrl}#readme`}>
                <ExternalLink aria-hidden="true" />
                README
              </a>
            </div>
          </div>

          <RenderSignalPanel />
        </section>

        <section className="section" id="metrics" aria-labelledby="metrics-title">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Project Metrics</p>
              <h2 id="metrics-title">Build-time metrics from the repository.</h2>
            </div>
            <p>
              The Pages build generates these counts from source files, tests, benchmarks, package
              exports, and GitHub workflow files before Vite renders the site.
            </p>
          </div>

          <div className="metrics-grid">
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section className="section section--split" id="api" aria-labelledby="api-title">
          <div>
            <p className="eyebrow">API Surfaces</p>
            <h2 id="api-title">Small entrypoints for explicit instrumentation.</h2>
          </div>
          <div className="api-list">
            {apiSurfaces.map((surface) => (
              <article className="api-card" key={surface.importPath}>
                <div>
                  <h3>{surface.title}</h3>
                  <code>{surface.importPath}</code>
                </div>
                <p>{surface.summary}</p>
                <span>{surface.metric}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section workflow-section" id="workflows" aria-labelledby="workflows-title">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Reusable Workflows</p>
              <h2 id="workflows-title">CI is split by lifecycle step.</h2>
            </div>
            <p>
              Validation, benchmarks, and Pages deployment call{" "}
              <code>moritzbrantner/reusable-workflows@workflow-standard-v1.3</code> with npm-native
              commands and narrow job permissions.
            </p>
          </div>

          <div className="workflow-map" aria-label="Workflow coverage map">
            {workflowNodes.map((node, index) => (
              <article className="workflow-node" data-tone={node.tone} key={node.title}>
                <node.icon aria-hidden="true" />
                <h3>{node.title}</h3>
                <p>{node.detail}</p>
                {index < workflowNodes.length - 1 ? <span aria-hidden="true" /> : null}
              </article>
            ))}
          </div>

          <div className="workflow-files">
            {projectData.workflows.map((workflow) => (
              <a href={`${projectData.repositoryUrl}/blob/main/${workflow.file}`} key={workflow.file}>
                <strong>{workflow.name}</strong>
                <code>{workflow.file}</code>
              </a>
            ))}
          </div>
        </section>

        <section className="section section--split" id="benchmarks" aria-labelledby="benchmarks-title">
          <div>
            <p className="eyebrow">Benchmarks</p>
            <h2 id="benchmarks-title">Performance checks focus on hot test helpers.</h2>
          </div>
          <div className="benchmark-panel">
            <div className="benchmark-chart" aria-label="Benchmark coverage visualization">
              <div style={{ height: "76%" }}>
                <span>Budget evaluator</span>
              </div>
              <div style={{ height: "62%" }}>
                <span>Stats recorder</span>
              </div>
            </div>
            <div className="benchmark-list">
              {benchmarkRows.map((row) => (
                <article key={row.label}>
                  <h3>{row.label}</h3>
                  <p>{row.description}</p>
                  <code>{row.source}</code>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--split" aria-labelledby="usage-title">
          <div>
            <p className="eyebrow">Usage</p>
            <h2 id="usage-title">Budgets live beside the scenario being measured.</h2>
          </div>
          <pre className="code-panel" tabIndex={0}>
            <code>{`await resetRenderStats(page);
await page.getByRole("button", { name: "Add item" }).click();

await expectRenderBudget(page, {
  profiler: {
    TimelineEditor: { updates: { max: 2 } },
  },
  components: {
    TimelineItem: { max: 10 },
  },
});`}</code>
          </pre>
        </section>
      </main>
    </>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#top" aria-label="react-render-budget home">
          <span className="brand__mark">RRB</span>
          <span>react-render-budget</span>
        </a>
        <nav className="nav" aria-label="Site">
          <a href="#metrics">Metrics</a>
          <a href="#api">API</a>
          <a href="#workflows">Workflows</a>
          <a href="#benchmarks">Benchmarks</a>
        </nav>
      </div>
    </header>
  );
}

function RenderSignalPanel() {
  return (
    <div className="signal-panel" aria-label="Render budget signal summary">
      <div className="signal-panel__header">
        <Activity aria-hidden="true" />
        <div>
          <span>Render scenario</span>
          <strong>Counter interaction</strong>
        </div>
      </div>
      <div className="signal-flow" aria-hidden="true">
        <div>
          <Code2 />
          <span>Instrument</span>
        </div>
        <i />
        <div>
          <Timer />
          <span>Measure</span>
        </div>
        <i />
        <div>
          <PackageCheck />
          <span>Assert</span>
        </div>
      </div>
      <dl className="signal-stats">
        <div>
          <dt>Profiler commits</dt>
          <dd>2 max</dd>
        </div>
        <div>
          <dt>Component renders</dt>
          <dd>10 max</dd>
        </div>
        <div>
          <dt>Budget result</dt>
          <dd>pass</dd>
        </div>
      </dl>
    </div>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <article className="metric-card">
      <div className="metric-card__icon">
        <Icon aria-hidden="true" />
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
      <p>{detail}</p>
    </article>
  );
}

export { App };
