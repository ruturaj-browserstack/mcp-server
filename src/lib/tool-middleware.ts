import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { trackMCP } from "./instrumentation.js";
import { BrowserStackConfig } from "./types.js";

/**
 * A tool handler as registered via `server.tool()` / `server.registerTool()`.
 * Typed loosely on purpose: the Proxy operates on the dynamic call shape
 * (the callback is always the last positional argument across every overload),
 * so the concrete `args`/`extra` types are irrelevant to the wrapper.
 */
type ToolHandler = (
  ...args: any[]
) => CallToolResult | Promise<CallToolResult>;

/**
 * A middleware decorates a tool handler with cross-cutting behaviour.
 * Compose more by appending to the chain in `withInstrumentation` — no
 * call-site changes required.
 */
export type ToolMiddleware = (
  toolName: string,
  handler: ToolHandler,
) => ToolHandler;

/**
 * Standard error envelope for a thrown handler error. Mirrors the message
 * format of `handleMCPError` in `./utils.ts` so error text stays uniform
 * across tools. Kept here (rather than calling `handleMCPError`) because that
 * helper also fires `trackMCP`, which would double-track.
 */
function toolErrorResult(toolName: string, error: unknown): CallToolResult {
  const readableToolName = toolName.replace(/([A-Z])/g, " $1").toLowerCase();
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return {
    content: [
      {
        type: "text",
        text: `Failed to ${readableToolName}: ${errorMessage}. Please open an issue on GitHub if the problem persists`,
      },
    ],
    isError: true,
  };
}

/**
 * Pulls a human-readable message out of a handler-returned `isError` result so
 * the telemetry event carries the tool's own failure text (e.g. "Failed to
 * create project/folder: ...") rather than a generic marker. Falls back to
 * `"tool_error"` when the result has no usable text content.
 */
function returnedErrorMessage(result: CallToolResult): string {
  const text = result.content?.find(
    (c): c is { type: "text"; text: string } => c.type === "text",
  )?.text;
  return text && text.trim().length > 0 ? text : "tool_error";
}

/**
 * Instrumentation middleware: fires exactly one `trackMCP` event per tool
 * invocation, after the handler settles, reflecting the true outcome.
 *
 * - clean result            -> success
 * - returned `isError: true` -> failure tracked with the result's own text
 *                               (author's result is returned unchanged)
 * - thrown error            -> failure + standard error envelope (no re-throw)
 *
 * The client version is read at call time (the client connects after tools are
 * registered). `config` is captured per server instance, so no user data lives
 * in process-shared state (multi-tenant safe).
 */
export function instrumentationMiddleware(
  server: McpServer,
  config: BrowserStackConfig,
): ToolMiddleware {
  return (toolName, handler) =>
    async (...callbackArgs) => {
      const clientInfo = server.server.getClientVersion()!;
      try {
        const result = await handler(...callbackArgs);
        trackMCP(
          toolName,
          clientInfo,
          result?.isError ? new Error(returnedErrorMessage(result)) : undefined,
          config,
        );
        return result;
      } catch (error) {
        trackMCP(toolName, clientInfo, error, config);
        return toolErrorResult(toolName, error);
      }
    };
}

/**
 * Wraps an `McpServer` so every `tool()` / `registerTool()` registration runs
 * its handler through the middleware chain. Tool files keep calling
 * `server.tool(...)` unchanged — they simply stop hand-writing instrumentation
 * and error envelopes.
 *
 * The callback is always the last positional argument in every `tool` and
 * `registerTool` overload, so the wrapper pops it, decorates it, and re-applies
 * the remaining arguments verbatim. Methods are bound to the real server so
 * private-field access inside the SDK does not see the Proxy as `this`.
 */
export function withInstrumentation(
  server: McpServer,
  config: BrowserStackConfig,
): McpServer {
  const middlewares: ToolMiddleware[] = [
    instrumentationMiddleware(server, config),
  ];

  const wrap = (name: string, handler: ToolHandler): ToolHandler =>
    middlewares.reduceRight((next, mw) => mw(name, next), handler);

  return new Proxy(server, {
    get(target, prop) {
      if (prop === "tool" || prop === "registerTool") {
        const register = (target as any)[prop].bind(target);
        return (...args: any[]) => {
          const last = args[args.length - 1];
          // Only instrument handler-bearing registrations; pass anything else
          // (e.g. a task-handler object) straight through.
          if (args.length < 2 || typeof last !== "function") {
            return register(...args);
          }
          const wrapped = wrap(args[0] as string, last as ToolHandler);
          return register(...args.slice(0, -1), wrapped);
        };
      }

      // Read everything else from the target's perspective and bind methods so
      // the underlying server (never the Proxy) is `this`.
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
