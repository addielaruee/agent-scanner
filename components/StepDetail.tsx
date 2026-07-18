import type { Span } from "@/lib/trace/types";

type StepDetailProps = {
  span: Span;
};

// A small label for each SpanType, since the raw type strings ("llm_thought")
// aren't great to show directly to a viewer.
const TYPE_LABELS: Record<Span["type"], string> = {
  user_task: "Task",
  llm_thought: "Claude thinking",
  tool_call: "Tool call",
  tool_result: "Tool result",
  final_response: "Final answer",
};

// Shows everything about the currently selected step: what the agent saw,
// what it decided, and what happened. If this is the flagged (hijacked)
// step, its flagReason is shown first, in an unmistakable red banner — the
// "gotcha, right here" moment the whole replay is built around.
export default function StepDetail({ span }: StepDetailProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {TYPE_LABELS[span.type]}
        </p>
        <h2 className="text-lg font-semibold">{span.title}</h2>
      </div>

      {span.flagged && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-400 text-red-700 dark:text-red-300 p-3 font-medium">
          ⚠ {span.flagReason}
        </div>
      )}

      {span.detail.input && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            What the agent saw
          </p>
          <p className="whitespace-pre-wrap text-sm">{span.detail.input}</p>
        </div>
      )}

      {span.detail.reasoning && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reasoning</p>
          <p className="whitespace-pre-wrap text-sm">{span.detail.reasoning}</p>
        </div>
      )}

      {span.detail.toolName && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tool call</p>
          <p className="text-sm">
            <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">
              {span.detail.toolName}
            </code>
            {span.detail.toolArgs !== undefined && (
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                {JSON.stringify(span.detail.toolArgs)}
              </span>
            )}
          </p>
        </div>
      )}

      {span.detail.toolOutput && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tool output</p>
          <p className="whitespace-pre-wrap text-sm">{span.detail.toolOutput}</p>
        </div>
      )}

      {span.detail.responseText && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Response</p>
          <p className="whitespace-pre-wrap text-sm">{span.detail.responseText}</p>
        </div>
      )}
    </div>
  );
}
