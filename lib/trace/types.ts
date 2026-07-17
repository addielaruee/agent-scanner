export type SpanType =
| "user_task"       // the benign task the user gave the agent
| "llm_thought"     // the model reasoning / deciding
| "tool_call"       // the agent invoking a tool
| "tool_result"     // what the tool returned
| "final_response"; // the agent's final answer

export type Span = {
id: string;
index: number;          // 0,1,2... order in the run (drives the timeline)
type: SpanType;
startedAt: number;      // milliseconds since epoch
endedAt: number;
title: string;          // short label shown on the timeline node
detail: {               // the full content shown when you click the node
  input?: string;       // what the agent SAW at this step (critical!)
  reasoning?: string;   // model's thinking, if available
  toolName?: string;
  toolArgs?: unknown;
  toolOutput?: string;
  responseText?: string;
};
flagged?: boolean;      // is THIS the hijack moment? (set in Phase 4)
flagReason?: string;    // plain-English why (set in Phase 4)
};

export type Finding = {
spanId: string;         // links a finding to a moment on the timeline
title: string;
whatHappened: string;
fix: string;
owaspCategory: string;  // e.g. "ASI01"
};

export type Run = {
id: string;             // e.g. "run-2026-07-16-153000"
scenarioId: string;
scenarioName: string;
createdAt: number;
task: string;           // the benign task given to the agent
spans: Span[];
verdict: {              // filled in Phase 4; empty-ish for now
  hijacked: boolean;
  score: number;        // 0-100
  owaspCategory?: string;
  findings: Finding[];
};
};