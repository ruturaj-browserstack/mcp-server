import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { withInstrumentation } from "../../src/lib/tool-middleware";
import { trackMCP } from "../../src/lib/instrumentation";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

vi.mock("../../src/lib/instrumentation", () => ({ trackMCP: vi.fn() }));

const mockConfig = {
  "browserstack-username": "fake-user",
  "browserstack-access-key": "fake-key",
};

const clientInfo = { name: "test-client", version: "9.9.9" };

/**
 * Minimal McpServer-shaped fake. `tool`/`registerTool` record the handler
 * (always the last argument) so tests can invoke the wrapped handler the
 * Proxy installed, and return a sentinel to stand in for `RegisteredTool`.
 */
function makeFakeServer(client: typeof clientInfo | undefined = clientInfo) {
  const calls: Array<{ method: string; args: any[]; handler: any }> = [];
  const fake: any = {
    server: { getClientVersion: () => client },
    connect: function () {
      // `this` must be the real fake, not the Proxy — used to assert binding.
      return this === fake;
    },
    tool: (...args: any[]) => {
      const reg = { method: "tool", args, handler: args[args.length - 1] };
      calls.push(reg);
      return reg;
    },
    registerTool: (...args: any[]) => {
      const reg = { method: "registerTool", args, handler: args[args.length - 1] };
      calls.push(reg);
      return reg;
    },
  };
  return { fake, calls };
}

const successResult: CallToolResult = {
  content: [{ type: "text", text: "ok" }],
};

beforeEach(() => vi.clearAllMocks());

describe("withInstrumentation", () => {
  it("fires trackMCP once with success when the handler returns a clean result", async () => {
    const { fake, calls } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);

    const handler = vi.fn().mockResolvedValue(successResult);
    proxy.tool("fetchScreenshots", "desc", {}, handler);

    const result = await calls[0].handler({ a: 1 }, { extra: true });

    expect(result).toBe(successResult);
    expect(trackMCP).toHaveBeenCalledTimes(1);
    expect(trackMCP).toHaveBeenCalledWith(
      "fetchScreenshots",
      clientInfo,
      undefined,
      mockConfig,
    );
  });

  it("fires trackMCP once with an error when the handler returns isError:true", async () => {
    const { fake, calls } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);

    const returnedError: CallToolResult = {
      content: [{ type: "text", text: "domain failure" }],
      isError: true,
    };
    proxy.tool("createTestCase", "desc", {}, vi.fn().mockResolvedValue(returnedError));

    const result = await calls[0].handler({});

    // Original result is returned unchanged (author's text preserved)...
    expect(result).toBe(returnedError);
    // ...but it is classified as a failure for analytics.
    expect(trackMCP).toHaveBeenCalledTimes(1);
    const errorArg = (trackMCP as Mock).mock.calls[0][2];
    expect(errorArg).toBeInstanceOf(Error);
  });

  it("fires trackMCP once with the error and returns a standard envelope when the handler throws", async () => {
    const { fake, calls } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);

    const thrown = new Error("boom");
    proxy.tool("fetchScreenshots", "desc", {}, vi.fn().mockRejectedValue(thrown));

    const result: CallToolResult = await calls[0].handler({});

    expect(trackMCP).toHaveBeenCalledTimes(1);
    expect(trackMCP).toHaveBeenCalledWith(
      "fetchScreenshots",
      clientInfo,
      thrown,
      mockConfig,
    );
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toBe(
      "Failed to fetch screenshots: boom. Please open an issue on GitHub if the problem persists",
    );
  });

  it("does not re-throw when the handler throws", async () => {
    const { fake, calls } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);
    proxy.tool("x", "d", {}, vi.fn().mockRejectedValue(new Error("nope")));

    await expect(calls[0].handler({})).resolves.toBeDefined();
  });

  it("forwards args and extra to the wrapped handler unchanged", async () => {
    const { fake, calls } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);
    const handler = vi.fn().mockResolvedValue(successResult);
    proxy.tool("t", "d", {}, handler);

    const args = { sessionId: "s-1" };
    const extra = { signal: "sig" };
    await calls[0].handler(args, extra);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(args, extra);
  });

  it("propagates the value returned by the underlying tool() (RegisteredTool)", () => {
    const { fake } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);
    const reg = proxy.tool("t", "d", {}, vi.fn());
    expect(reg).toBeDefined();
    expect((reg as any).method).toBe("tool");
  });

  it("instruments across overloads (no-schema, full, registerTool)", async () => {
    const { fake, calls } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);

    proxy.tool("noSchema", vi.fn().mockResolvedValue(successResult)); // tool(name, cb)
    proxy.tool("full", "d", {}, vi.fn().mockResolvedValue(successResult)); // tool(name, desc, schema, cb)
    (proxy as any).registerTool(
      "viaRegister",
      { description: "d" },
      vi.fn().mockResolvedValue(successResult),
    );

    for (const call of calls) {
      await call.handler({});
    }
    expect(trackMCP).toHaveBeenCalledTimes(3);
    expect((trackMCP as Mock).mock.calls.map((c) => c[0])).toEqual([
      "noSchema",
      "full",
      "viaRegister",
    ]);
  });

  it("keeps configs isolated across proxies (multi-tenant safety)", async () => {
    const cfgA = { "browserstack-username": "a", "browserstack-access-key": "ka" };
    const cfgB = { "browserstack-username": "b", "browserstack-access-key": "kb" };
    const { fake: fa, calls: ca } = makeFakeServer();
    const { fake: fb, calls: cb } = makeFakeServer();

    withInstrumentation(fa, cfgA as any).tool("t", "d", {}, vi.fn().mockResolvedValue(successResult));
    withInstrumentation(fb, cfgB as any).tool("t", "d", {}, vi.fn().mockResolvedValue(successResult));

    await ca[0].handler({});
    await cb[0].handler({});

    expect((trackMCP as Mock).mock.calls[0][3]).toBe(cfgA);
    expect((trackMCP as Mock).mock.calls[1][3]).toBe(cfgB);
  });

  it("passes non-tool property access through to the underlying server", () => {
    const { fake } = makeFakeServer();
    const proxy = withInstrumentation(fake, mockConfig as any);
    // property read
    expect(proxy.server).toBe(fake.server);
    // method called on the proxy still binds `this` to the real server
    expect((proxy as any).connect()).toBe(true);
  });

  it("reads client version at call time, not registration time", async () => {
    const { fake, calls } = makeFakeServer(undefined);
    // Client connects only after the tool is registered.
    const proxy = withInstrumentation(fake, mockConfig as any);
    proxy.tool("t", "d", {}, vi.fn().mockResolvedValue(successResult));
    fake.server.getClientVersion = () => clientInfo;

    await calls[0].handler({});
    expect(trackMCP).toHaveBeenCalledWith("t", clientInfo, undefined, mockConfig);
  });
});
