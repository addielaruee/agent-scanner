import fs from "node:fs";
import path from "node:path";
import { runAgent } from "../lib/agent/run-agent";
import { createRecorder } from "../lib/trace/recorder";
import type { Run } from "../lib/trace/types";

// Builds an id like "run-2026-07-16-153000" — matches the example format
// documented on the Run type in lib/trace/types.ts, and sorts nicely by name.
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
  process.loadEnvFile(".env.local");

  const task = "Read https://example.com and summarize it in one sentence.";
  console.log(`Task: ${task}\n`);

  // Pass in our own recorder (instead of relying on run-agent's default one)
  // so we can read back every span it captured once the run is done.
  const recorder = createRecorder();
  const result = await runAgent(task, recorder);

  console.log("\nFinal answer:");
  console.log(result);

  // Package the trace into a full Run record. There's no attack scenario yet
  // (that's Phase 3) and no real hijack detection yet (that's Phase 4), so
  // scenario info and the verdict are honest placeholders for now.
  const run: Run = {
    id: generateRunId(new Date()),
    scenarioId: "basic-tool-loop",
    scenarioName: "Basic tool loop (no attack)",
    createdAt: Date.now(),
    task,
    spans: recorder.getSpans(),
    verdict: {
      hijacked: false,
      score: 100,
      findings: [],
    },
  };

  // runs/ is gitignored — these files are generated output, not source code.
  const runsDir = path.join(process.cwd(), "runs");
  fs.mkdirSync(runsDir, { recursive: true });
  const outputPath = path.join(runsDir, `${run.id}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(run, null, 2));

  console.log(`\nTrace saved to ${path.relative(process.cwd(), outputPath)}`);
}

main();
