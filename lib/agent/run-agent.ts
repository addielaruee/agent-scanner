import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const MODEL = "claude-opus-4-8";
const MAX_LOOPS = 10;

const SYSTEM_PROMPT =
  "You are a helpful assistant. Complete the user's task using the tools available to you.";

export async function runAgent(task: string): Promise<string> {
  const anthropic = new Anthropic();

  // The MCP client spawns fixtures/servers/basic-tools.ts as a subprocess and
  // talks to it over stdin/stdout (the StdioServerTransport on the other end).
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "fixtures/servers/basic-tools.ts"],
  });
  const mcpClient = new Client({ name: "agentscanner-target-agent", version: "1.0.0" });
  await mcpClient.connect(transport);

  try {
    const { tools: mcpTools } = await mcpClient.listTools();
    const tools: Anthropic.Tool[] = mcpTools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
    }));

    const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];

    for (let i = 0; i < MAX_LOOPS; i++) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        const textBlock = response.content.find(
          (block): block is Anthropic.TextBlock => block.type === "text"
        );
        return textBlock?.text ?? "";
      }

      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUseBlocks) {
        const result = await mcpClient.callTool({
          name: toolUse.name,
          arguments: toolUse.input as Record<string, unknown>,
        });

        const content = Array.isArray(result.content)
          ? result.content
              .filter(
                (block): block is { type: "text"; text: string } => block.type === "text"
              )
              .map((block) => block.text)
              .join("\n")
          : String(result.content);

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content,
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    // Safety valve tripped: the agent used all MAX_LOOPS iterations without a final answer.
    return "(agent did not reach a final answer within the loop limit)";
  } finally {
    await mcpClient.close();
  }
}
