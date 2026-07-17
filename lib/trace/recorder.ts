import type { Span, SpanType } from "./types";

// A span that has been started but not yet closed with endSpan().
type OpenSpan = {
  type: SpanType;
  title: string;
  startedAt: number;
};

// Records one agent run as an ordered list of finished spans (steps).
// Usage: call startSpan() when a step begins, then endSpan(detail) when it
// finishes. Only one span can be open at a time, matching how the agent loop
// runs one step after another. Call getSpans() at the end to get the full,
// ordered list to save into a trace file.
export function createRecorder() {
  const spans: Span[] = [];
  let open: OpenSpan | null = null;

  function startSpan(type: SpanType, title: string): void {
    if (open) {
      // Catches a bug where a step forgets to close the previous span
      // before starting a new one, instead of silently losing data.
      throw new Error(
        `startSpan("${type}") called while span "${open.title}" is still open — call endSpan() first.`
      );
    }
    // Stamp the start time now, before any work for this step happens.
    open = { type, title, startedAt: Date.now() };
  }

  function endSpan(detail: Span["detail"] = {}): void {
    if (!open) {
      throw new Error("endSpan() called with no open span — call startSpan() first.");
    }

    spans.push({
      id: crypto.randomUUID(),
      index: spans.length, // spans are numbered in the order they were recorded
      type: open.type,
      title: open.title,
      startedAt: open.startedAt,
      endedAt: Date.now(), // stamp the end time now, right as the step finishes
      detail,
    });

    open = null; // ready for the next startSpan() call
  }

  // Returns every span recorded so far, in order.
  function getSpans(): Span[] {
    return spans;
  }

  return { startSpan, endSpan, getSpans };
}
