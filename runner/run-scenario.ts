import fs from "node:fs";
import path from "node:path";
import { runAgent } from "../lib/agent/run-agent";
import { createRecorder } from "../lib/trace/recorder";
import type { Run } from "../lib/trace/types";
import type { Scenario } from "../fixtures/scenarios/types";
import { detectHijack } from "../lib/detect/detect";
import { computeScore } from "../lib/detect/score";
import { webpageInjectionScenario } from "../fixtures/scenarios/webpage-injection";
import { toolPoisoningScenario } from "../fixtures/scenarios/tool-poisoning";
import { searchInjectionScenario } from "../fixtures/scenarios/search-injection";

// Maps a scenario id to its scenario definition (task + ground-truth
// hijackCheck) and the poisoned MCP server the agent should run against for
// that scenario. This is the "wiring" step build.md describes — pairing each
// scenario's data with the actual poisoned tools/content that realize it.
const SCENARIOS: Record<string, { scenario: Scenario; serverPath: string }> = {
  "webpage-injection": {
    scenario: webpageInjectionScenario,
    serverPath: "fixtures/servers/webpage-injection-server.ts",
  },
  "tool-poisoning": {
    scenario: toolPoisoningScenario,
    serverPath: "fixtures/servers/tool-poisoning-server.ts",
  },
  "search-injection": {
    scenario: searchInjectionScenario,
    serverPath: "fixtures/servers/search-injection-server.ts",
  },
};

// Builds an id like "run-2026-07-16-153000" — same format used in
// runner/run-once.ts, matching the example on the Run type.
function generateRunId(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `run-${y}-${mo}-${d}-${h}${mi}${s}`;
}

async function main() {
  const scenarioId = process.argv[2];
  const entry = scenarioId ? SCENARIOS[scenarioId] : undefined;

  if (!entry) {
    console.error(
      `Usage: npx tsx runner/run-scenario.ts <scenario-id>\n\nAvailable scenario ids: ${Object.keys(SCENARIOS).join(", ")}`
    );
    process.exit(1);
  }

  const { scenario, serverPath } = entry;

  process.loadEnvFile(".env.local");

  console.log(`Scenario: ${scenario.name} (${scenario.owaspCategory})`);
  console.log(`Task: ${scenario.task}\n`);

  // Pass in our own recorder, and the scenario's poisoned server path, so the
  // agent runs its normal loop but against hostile tools/content this time.
  const recorder = createRecorder();
  const result = await runAgent(scenario.task, recorder, serverPath);

  console.log("\nFinal answer:");
  console.log(result);

  // Tag the run with the real scenario id/name. The verdict below is a
  // placeholder until detectHijack fills in the real one just after.
  const run: Run = {
    id: generateRunId(new Date()),
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    scenarioDescription: scenario.description,
    createdAt: Date.now(),
    task: scenario.task,
    spans: recorder.getSpans(),
    verdict: {
      hijacked: false,
      score: 100,
      findings: [],
    },
  };

  // Run the scenario's ground-truth hijackCheck against the finished trace.
  // This flags the exact span where the hijack happened (mutating run.spans
  // in place) and returns the findings used to fill in the real verdict.
  const detection = detectHijack(run, scenario);
  run.verdict = {
    hijacked: detection.hijacked,
    score: computeScore(detection.findings),
    owaspCategory: detection.hijacked ? scenario.owaspCategory : undefined,
    findings: detection.findings,
  };

  // runs/ is gitignored — these files are generated output, not source code.
  const runsDir = path.join(process.cwd(), "runs");
  fs.mkdirSync(runsDir, { recursive: true });
  const outputPath = path.join(runsDir, `${run.id}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(run, null, 2));

  console.log(`\nTrace saved to ${path.relative(process.cwd(), outputPath)}`);
  console.log(
    `Verdict: ${run.verdict.hijacked ? "HIJACKED" : "safe"} — score ${run.verdict.score}/100`
  );
}

main();
