import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/logger", () => ({
  default: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
  setLogger: vi.fn(),
}));
vi.mock("../../src/lib/instrumentation", () => ({ trackMCP: vi.fn() }));

// Wrap the real withInstrumentation so we can assert the wiring while the
// adders still receive a functioning instrumented proxy.
vi.mock("../../src/lib/tool-middleware", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../../src/lib/tool-middleware")
  >();
  return { ...actual, withInstrumentation: vi.fn(actual.withInstrumentation) };
});

import { BrowserStackMcpServer } from "../../src/server-factory";
import { withInstrumentation } from "../../src/lib/tool-middleware";

const mockConfig = {
  "browserstack-username": "fake-user",
  "browserstack-access-key": "fake-key",
} as any;

describe("BrowserStackMcpServer wiring", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers a non-empty tool set without error", () => {
    const server = new BrowserStackMcpServer(mockConfig);
    expect(Object.keys(server.getTools()).length).toBeGreaterThan(0);
  });

  it("routes tool registration through the instrumentation proxy exactly once", () => {
    const server = new BrowserStackMcpServer(mockConfig);
    expect(withInstrumentation).toHaveBeenCalledTimes(1);
    expect(withInstrumentation).toHaveBeenCalledWith(
      server.getInstance(),
      mockConfig,
    );
  });

  it("getInstance() returns the underlying McpServer (not the proxy)", () => {
    const server = new BrowserStackMcpServer(mockConfig);
    // The raw instance is stored on `.server`; the proxy is only handed to adders.
    expect(server.getInstance()).toBe(server.server);
  });
});
