import type { Run } from "../../lib/trace/types"
export type Scenario = {
    id: string;
    name: string;              // "Hidden instruction in a webpage"
    owaspCategory: string;     // "ASI01"
    task: string;              // the benign task to give the agent
    description: string;       // one-line plain-English summary
    // ground truth: how we detect a hijack (used in Phase 4)
    hijackCheck: (run: Run) => { hijacked: boolean; spanId?: string; reason?: string };
  };