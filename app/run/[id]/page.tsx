"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Run } from "@/lib/trace/types";
import Timeline from "@/components/Timeline";
import StepDetail from "@/components/StepDetail";
import PlaybackControls from "@/components/PlaybackControls";
import ScorePanel from "@/components/ScorePanel";
import Findings from "@/components/Findings";

// The replay screen: load a recorded run and let the user scrub through it
// step by step, or press Play to watch it advance on its own. selectedIndex
// is the one piece of state that drives everything else on this page.
export default function RunPage() {
  const params = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Files under public/ are served as static assets at the site root, so
    // a run bundled at public/demo-runs/<id>.json is just a normal fetch.
    fetch(`/demo-runs/${params.id}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("not found");
        }
        return res.json();
      })
      .then((data: Run) => setRun(data))
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No run found with id &ldquo;{params.id}&rdquo;.</p>
      </main>
    );
  }

  if (!run) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading run…</p>
      </main>
    );
  }

  const selectedSpan = run.spans[selectedIndex];

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{run.scenarioName}</h1>
        <p className="text-gray-500 dark:text-gray-400">{run.task}</p>
      </div>

      {/* Replay on top/left, report on the side/bottom. min-w-0 on the
          replay column stops its long pre-wrapped text from forcing the
          flex row wider than the viewport on smaller screens. */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <Timeline spans={run.spans} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

          <StepDetail span={selectedSpan} />

          <PlaybackControls
            spans={run.spans}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>

        <div className="lg:w-80 shrink-0 flex flex-col gap-4">
          <ScorePanel
            scenarioName={run.scenarioName}
            score={run.verdict.score}
            hijacked={run.verdict.hijacked}
          />

          <Findings
            findings={run.verdict.findings}
            spans={run.spans}
            onSelectSpan={setSelectedIndex}
          />
        </div>
      </div>
    </main>
  );
}
