import fs from "node:fs";
import path from "node:path";
import RunCard from "@/components/RunCard";
import type { Run } from "@/lib/trace/types";

type RunSummary = {
  id: string;
  scenarioName: string;
  description: string;
  score: number;
  hijacked: boolean;
};

// Reads every bundled run JSON and pulls out just what a gallery card needs.
// This runs server-side (this page has no "use client"), so it's a plain
// filesystem read — no fetch, no client-side loading state required.
function loadRunSummaries(): RunSummary[] {
  const demoRunsDir = path.join(process.cwd(), "public", "demo-runs");
  const files = fs.readdirSync(demoRunsDir).filter((file) => file.endsWith(".json"));

  return files.map((file) => {
    const run: Run = JSON.parse(fs.readFileSync(path.join(demoRunsDir, file), "utf-8"));

    return {
      id: run.id,
      scenarioName: run.scenarioName,
      // Older runs (from before Phase 7) don't have scenarioDescription —
      // fall back to the task so those cards still render sensibly.
      description: run.scenarioDescription ?? run.task,
      score: run.verdict.score,
      hijacked: run.verdict.hijacked,
    };
  });
}

export default function Home() {
  const runs = loadRunSummaries();

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-16 flex flex-col gap-16">
      <section className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Watch the exact moment an AI agent gets hijacked — and how to fix it.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          AI agents can be secretly tricked by hidden instructions into doing things you never
          asked for. These are real, recorded attacks — replayed step by step, with a
          plain-English fix for each one.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">1. Connect an agent</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Point AgentScanner at an AI agent and the tools it can use.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">2. We attack it safely</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Run real prompt-injection scenarios against fake, harmless tools.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">3. Watch where it broke</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Scrub the replay to the exact step it got hijacked — or resisted.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Recorded runs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {runs.map((run) => (
            <RunCard key={run.id} {...run} />
          ))}
        </div>
      </section>
    </main>
  );
}
