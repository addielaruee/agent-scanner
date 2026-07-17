import { runAgent } from "../lib/agent/run-agent";

async function main() {
  process.loadEnvFile(".env.local");

  const task = "Read https://example.com and summarize it in one sentence.";
  console.log(`Task: ${task}\n`);

  const result = await runAgent(task);

  console.log("\nFinal answer:");
  console.log(result);
}

main();
