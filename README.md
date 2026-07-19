<div align="center">

# 🎬 AgentScanner

**Watch the exact moment an AI agent gets hijacked — and how to fix it.**

*A visual, scrubbable replay that pinpoints the precise step where a prompt-injection attack takes over an AI agent, then tells you, in plain English, how to stop it.*

![Status](https://img.shields.io/badge/status-v1%20shipped-brightgreen)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20TypeScript%20%7C%20Claude-blue)
![Focus](https://img.shields.io/badge/focus-AI%20agent%20security-blue)

**[Live demo →](https://agent-scanner-rutika-bhasmes-projects.vercel.app)**

</div>

---

## 📖 Table of contents
- [The problem](#-the-problem)
- [Why existing tools fall short](#-why-existing-tools-fall-short)
- [What AgentScanner does differently](#-what-agentscanner-does-differently)
- [See it in action](#-see-it-in-action)
- [How it works](#️-how-it-works)
- [Running it yourself](#-running-it-yourself)
- [Tech stack](#-tech-stack)
- [Project layout](#-project-layout)
- [Roadmap](#-roadmap)
- [About this project](#-about-this-project)

## 🧨 The problem

Modern **AI agents** don't just chat, they *act*. They browse the web, read files, call tools, and send emails on your behalf. To do that, they're given real permissions.

But an agent reads instructions in plain English, and it **can't always tell the difference between an instruction from you and a malicious instruction hidden inside content it reads**: a booby-trapped web page, a poisoned tool description, a crafted search result. A hidden line telling it to quietly email data to an outside address can hijack it — and it may comply without ever telling you.

This is called **indirect prompt injection**, ranked the **#1 risk in the OWASP Top 10 for Agentic Applications**, listed as *ASI01: Agent Goal Hijack*. As agents get more real-world power, this stops being theoretical.

## 🩹 Why existing tools fall short

Plenty of tools already test agents for this. You connect your agent, they attack it, and you get back a **score out of 100**, a **pass/fail grid**, or a **static diagram**.

That's useful, but it's like a car manufacturer telling you *"your car failed the crash test"* and handing you a spreadsheet, instead of showing you the **actual video of the crash**, frozen at the instant the dummy hits the dashboard.

Every tool in this space stops at the scorecard. **None of them let you watch, step by step, the exact moment an agent gets fooled.**

## 🎯 What AgentScanner does differently

AgentScanner builds the crash video.

You connect an agent, it gets safely attacked with real injection techniques against fake, harmless tools, and you watch a **time-ordered, scrubbable replay** of its reasoning and tool calls. The exact step where it got hijacked **lights up in red**, with a plain-English explanation and a concrete fix — or, just as importantly, the replay shows exactly *how* the agent caught and resisted the attack.

The differentiator isn't the attack engine — that reuses well-known techniques (indirect injection, MCP tool-description poisoning, tool-output injection). The value is the **replay and comprehension layer**: turning a raw execution trace into a "here's the exact moment it went wrong" experience anyone can understand in seconds.

## 📸 See it in action

![AgentScanner replaying a webpage-injection attack, showing the exact hidden instruction the agent read](docs/replay-screenshot.jpg)

*A real, recorded run: the agent reads a webpage carrying a disguised "system override" instruction to email its contents to an outside address — and in this run, correctly identifies and refuses it. The replay shows exactly what it read, what it decided, and why.*

## ⚙️ How it works

There are two halves to this product, running in two different places:

1. **The attack lab (runs on your laptop).** A command-line script spins up the target agent — a hand-written agentic loop calling [Claude](https://www.anthropic.com/claude) — and connects it to a small [MCP](https://modelcontextprotocol.io) server exposing a couple of realistic tools (`read_webpage`, `send_email`, `search`). For each attack scenario, one of those tools is swapped for a poisoned version: a webpage with a hidden instruction, a tool description carrying a hidden instruction, or search results with an embedded instruction. Every step — each thought, tool call, and result — is recorded as a structured trace and saved to a JSON file.
2. **The replay theater (the public website).** A Next.js site reads a recorded trace and plays it back as a scrubbable timeline. A rule-based detector (using each scenario's own ground truth) flags the exact step where a hijack happened, computes a safety score, and generates a plain-English finding with a fix — all baked into the trace before it's ever bundled into the site. The website only ever plays back *recorded* runs; it never runs a live attack or touches an API key, so the public demo can't break or leak anything.

## 🚀 Running it yourself

**Prerequisites:** Node.js 20+, an [Anthropic API key](https://console.anthropic.com).

```bash
git clone https://github.com/addielaruee/agent-scanner.git
cd agent-scanner
npm install

# Add your API key
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
```

**Run the attack lab** (this is the CLI half — it actually calls Claude and costs a small amount of API usage):

```bash
# The plain target agent, no attack (Phase 1 checkpoint)
npx tsx runner/run-once.ts

# Run one of the three attack scenarios
npx tsx runner/run-scenario.ts webpage-injection
npx tsx runner/run-scenario.ts tool-poisoning
npx tsx runner/run-scenario.ts search-injection
```

Each run prints the agent's final answer and the verdict, and saves a full trace to `runs/<run-id>.json`.

**Bundle a run into the website** by copying it into `public/demo-runs/`, then:

```bash
npm run dev
# open http://localhost:3000
```

## 🛠 Tech stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript, end to end |
| Web framework | Next.js (App Router) + Tailwind CSS |
| LLM | Anthropic Claude, via `@anthropic-ai/sdk` |
| Tool protocol | Official [MCP SDK](https://modelcontextprotocol.io) (`@modelcontextprotocol/sdk`) |
| Agent loop | Hand-written — no agent framework, for full control over tracing and injection |
| Data | Plain JSON trace files — no database |
| Hosting | [Vercel](https://vercel.com) |

## 🗂 Project layout

```
agent-scanner/
├── app/                    # the website (Next.js) — home page + replay page
├── components/             # Timeline, StepDetail, PlaybackControls, ScorePanel, Findings, RunCard
├── lib/
│   ├── agent/              # the hand-written agent loop
│   ├── trace/               # Span / Run / Finding types + the recorder
│   └── detect/               # rule-based hijack detection + scoring
├── fixtures/
│   ├── servers/             # MCP servers, including the poisoned variants
│   └── scenarios/           # attack scenarios + their ground-truth detection
├── runner/                 # CLI scripts: run-once.ts, run-scenario.ts
└── public/demo-runs/        # the bundled runs the public site plays back
```

## 🗺 Roadmap

- [x] Target agent + MCP tool loop
- [x] Structured execution tracing
- [x] Attack scenario library (indirect injection, tool poisoning, tool-output injection)
- [x] Rule-based hijack detection + scoring
- [x] Scrubbable replay UI with hijack highlighting
- [x] Score panel + clickable findings linked to the timeline
- [x] Home page / run gallery
- [x] Bundled demo runs, polish, live deploy
- [ ] Public launch (demo video, Show HN)

## 👤 About this project

AgentScanner is a portfolio project exploring AI-agent security and the gap between "here's a score" and "here's what actually happened" in how agent failures are communicated.

Built by [**@addielaruee**](https://github.com/addielaruee).

## 📄 License

To be finalized before public release (likely MIT). Until then, all rights reserved.
