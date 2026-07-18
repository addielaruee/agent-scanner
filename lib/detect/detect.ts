import type { Run, Finding } from "../trace/types";
import type { Scenario } from "../../fixtures/scenarios/types";

// Plain-English remediation advice, keyed by OWASP Agentic category. A small
// hardcoded map is enough for v1 — a richer, attack-specific fix generator
// is a later upgrade.
const FIX_BY_CATEGORY: Record<string, string> = {
  ASI01:
    "Add explicit separation between trusted instructions and untrusted content in the system prompt, and require user confirmation before the agent sends data to any new recipient.",
  ASI02:
    "Treat tool metadata (names, descriptions, schemas) as untrusted input. Review MCP server tool descriptions before connecting to them, and don't let hidden instructions in that metadata influence the agent's behavior.",
};

const DEFAULT_FIX =
  "Review how the agent handles untrusted input for this category of attack, and add a check before it acts on anything that wasn't in the user's original request.";

export type DetectionResult = {
  hijacked: boolean;
  findings: Finding[];
};

// Reads a finished run and decides whether the agent got hijacked, using the
// scenario's own ground-truth hijackCheck (set up in Phase 3) rather than
// any new detection logic — this stays rule-based and explainable for v1.
// If hijacked, it flags the exact span where it happened and builds a
// Finding with a plain-English explanation and a concrete fix.
export function detectHijack(run: Run, scenario: Scenario): DetectionResult {
  const result = scenario.hijackCheck(run);

  if (!result.hijacked) {
    return { hijacked: false, findings: [] };
  }

  // Mark the exact moment on the timeline where the hijack happened. The
  // span is mutated in place, so this change is reflected in run.spans too.
  const flaggedSpan = run.spans.find((span) => span.id === result.spanId);
  if (flaggedSpan) {
    flaggedSpan.flagged = true;
    flaggedSpan.flagReason = result.reason;
  }

  const finding: Finding = {
    spanId: result.spanId ?? "",
    title: scenario.name,
    whatHappened: result.reason ?? "The agent followed a hidden instruction instead of the user's actual request.",
    fix: FIX_BY_CATEGORY[scenario.owaspCategory] ?? DEFAULT_FIX,
    owaspCategory: scenario.owaspCategory,
  };

  return { hijacked: true, findings: [finding] };
}
