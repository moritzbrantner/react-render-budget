import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function listFiles(directory, predicate = () => true) {
  const files = [];
  await walk(path.join(root, directory), files);

  return files.filter(predicate).sort();
}

async function walk(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(entryPath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(path.relative(root, entryPath).split(path.sep).join("/"));
    }
  }
}

async function countMatches(files, pattern) {
  let count = 0;

  for (const file of files) {
    const content = await readFile(path.join(root, file), "utf8");
    count += content.match(pattern)?.length ?? 0;
  }

  return count;
}

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const sourceFiles = await listFiles(
  "src",
  (file) => /\.(ts|tsx)$/.test(file) && !file.endsWith(".d.ts"),
);
const unitTestFiles = await listFiles("tests", (file) => /\.test\.(ts|tsx)$/.test(file));
const e2eFiles = await listFiles("examples/playwright-react/tests", (file) =>
  /\.spec\.(ts|tsx)$/.test(file),
);
const benchmarkFiles = await listFiles("benchmarks", (file) => /\.bench\.(ts|tsx)$/.test(file));
const workflowFiles = await listFiles(".github/workflows", (file) => /\.ya?ml$/.test(file));

const exportedEntrypoints = Object.keys(packageJson.exports ?? {}).filter(
  (entrypoint) => entrypoint !== "./package.json",
);

const data = {
  packageName: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  repositoryUrl: "https://github.com/moritzbrantner/react-render-budget",
  exportedEntrypoints,
  metrics: {
    sourceFiles: sourceFiles.length,
    apiEntrypoints: exportedEntrypoints.length,
    unitTestFiles: unitTestFiles.length,
    unitTests: await countMatches(unitTestFiles, /\b(?:it|test)\(/g),
    e2eSpecFiles: e2eFiles.length,
    e2eTests: await countMatches(e2eFiles, /\btest\(/g),
    benchmarkFiles: benchmarkFiles.length,
    benchmarkWorkloads: await countMatches(benchmarkFiles, /\bbench\(/g),
    workflowFiles: workflowFiles.length,
  },
  workflows: workflowFiles.map((file) => ({
    file,
    name: file
      .split("/")
      .at(-1)
      .replace(/\.ya?ml$/, "")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  })),
};

await writeFile(
  path.join(root, "pages/src/generated/project-metrics.json"),
  `${JSON.stringify(data, null, 2)}\n`,
);
