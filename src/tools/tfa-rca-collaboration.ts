import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { trackMCP } from "../lib/instrumentation.js";
import { handleMCPError } from "../lib/utils.js";
import { BrowserStackConfig } from "../lib/types.js";
import { TFA_RCA_TURN_PARAMS } from "./tfa-rca-utils/constants.js";
import {
  submitTfaRcaTurn,
  TfaRcaTurnArgs,
  TfaRcaTurnError,
} from "./tfa-rca-utils/submit-turn.js";

const TOOL_NAME = "tfaRcaTurn";

export async function tfaRcaTurnTool(
  args: TfaRcaTurnArgs,
  config: BrowserStackConfig,
  context?: any,
): Promise<CallToolResult> {
  const result = await submitTfaRcaTurn(args, config, context);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            status: result.status,
            confidence: result.confidence,
            threadId: result.threadId,
            replyMarkdown: result.replyMarkdown,
            tasks: result.tasks,
            questions: result.questions,
            ...(result.status === "PENDING" && { turnId: result.turnId }),
          },
          null,
          2,
        ),
      },
    ],
  };
}

export default function addTfaRcaCollaborationTools(
  server: McpServer,
  config: BrowserStackConfig,
): Record<string, any> {
  const tools: Record<string, any> = {};

  tools.tfaRcaTurn = server.tool(
    TOOL_NAME,
    "Submit one collaborative RCA turn for a test run to the TFA agent; returns its reply, status, and tasks.",
    TFA_RCA_TURN_PARAMS,
    async (args, context) => {
      try {
        const result = await tfaRcaTurnTool(args, config, context);
        trackMCP(
          TOOL_NAME,
          server.server.getClientVersion()!,
          undefined,
          config,
        );
        return result;
      } catch (error) {
        // Domain failures carry a client-safe, group-scope-safe message.
        if (error instanceof TfaRcaTurnError) {
          trackMCP(TOOL_NAME, server.server.getClientVersion()!, error, config);
          const readable = TOOL_NAME.replace(/([A-Z])/g, " $1").toLowerCase();
          return {
            content: [
              {
                type: "text",
                text: `Failed to ${readable}: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        return handleMCPError(TOOL_NAME, server, config, error);
      }
    },
  );

  return tools;
}
