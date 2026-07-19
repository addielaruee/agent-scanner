import type { Finding, Span } from "@/lib/trace/types";

type FindingsProps = {
  findings: Finding[];
  spans: Span[];
  onSelectSpan: (index: number) => void;
};

// Human-readable name per OWASP Agentic category, for the finding's tag.
const OWASP_LABELS: Record<string, string> = {
  ASI01: "Agent Goal Hijack",
  ASI02: "Tool Poisoning",
};

// Lists every finding from the run's verdict — what happened, in plain
// English, and the concrete fix, in its own box. Each finding is clickable:
// clicking it jumps the replay timeline to the exact step it's about, so
// reading the problem and watching the problem are one click apart.
export default function Findings({ findings, spans, onSelectSpan }: FindingsProps) {
  if (findings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
        No hijack detected — the agent stayed safe.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {findings.map((finding) => {
        // Findings are linked to the timeline by spanId — look up which
        // step that is so clicking the card can jump the replay there.
        const spanIndex = spans.findIndex((span) => span.id === finding.spanId);
        const owaspLabel = OWASP_LABELS[finding.owaspCategory] ?? finding.owaspCategory;

        return (
          <button
            key={finding.spanId}
            type="button"
            onClick={() => {
              if (spanIndex !== -1) {
                onSelectSpan(spanIndex);
              }
            }}
            className="text-left rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 flex flex-col gap-2 hover:border-red-500 dark:hover:border-red-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{finding.title}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200">
                {finding.owaspCategory} — {owaspLabel}
              </span>
            </div>

            <p className="text-sm">{finding.whatHappened}</p>

            <div className="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Fix
              </p>
              <p className="text-sm">{finding.fix}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
