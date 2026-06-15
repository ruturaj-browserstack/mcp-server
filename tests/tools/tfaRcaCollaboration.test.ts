import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import addTfaRcaCollaborationTools, {
  tfaRcaTurnTool,
} from "../../src/tools/tfa-rca-collaboration";
import { apiClient } from "../../src/lib/apiClient";
import { trackMCP } from "../../src/lib/instrumentation";
import {
  O11Y_BASE_URL,
  POLL_INITIAL_DELAY_MS,
  POLL_INTERVAL_MS,
  POLL_MAX_WAIT_MS,
} from "../../src/tools/tfa-rca-utils/constants";

vi.mock("../../src/lib/apiClient", () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));
vi.mock("../../src/lib/get-auth", () => ({
  getBrowserStackAuth: vi.fn().mockReturnValue("fake-user:fake-key"),
}));
vi.mock("../../src/lib/instrumentation", () => ({ trackMCP: vi.fn() }));
vi.mock("../../src/logger", () => ({
  default: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const mockConfig = {
  "browserstack-username": "fake-user",
  "browserstack-access-key": "fake-key",
};

// Make poll delays instant so the cap-exceeded test can fast-forward.
vi.useFakeTimers();

const post = apiClient.post as Mock;
const get = apiClient.get as Mock;

function ok(data: any, status = 200) {
  return { ok: true, status, data };
}
function nonOk(status: number, data: any = {}) {
  return { ok: false, status, data };
}

/**
 * Drive a turn that uses real setTimeout-based delays under fake timers.
 * Attach to the promise first (so rejections are always observed), then
 * advance timers concurrently.
 */
async function runWithTimers<T>(p: Promise<T>): Promise<T> {
  const settled = p.then(
    (v) => ({ ok: true as const, v }),
    (e) => ({ ok: false as const, e }),
  );
  await vi.runAllTimersAsync();
  const r = await settled;
  if (r.ok) return r.v;
  throw r.e;
}

describe("tfaRcaTurnTool", () => {
  beforeEach(() => vi.clearAllMocks());

  it("happy submit+poll → RESOLVED, isError falsy", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-1", threadId: "t-1", status: "working" }),
    );
    get.mockResolvedValueOnce(ok({ status: "working" })).mockResolvedValueOnce(
      ok({
        status: "completed",
        threadId: "t-1",
        replyMarkdown:
          'Done.\n<!-- tfa-status: {"status":"RESOLVED","confidence":"high"} -->',
        meta: { huge: "blob".repeat(1000) },
      }),
    );

    const result = await runWithTimers(
      tfaRcaTurnTool(
        { testRunId: "tr-1", message: "digest" },
        mockConfig as any,
      ),
    );

    expect(result.isError).toBeFalsy();
    const payload = JSON.parse(result.content[0].text as string);
    expect(payload.status).toBe("RESOLVED");
    expect(payload.confidence).toBe("high");
    expect(payload.threadId).toBe("t-1");
    expect(payload.tasks).toEqual([]);
    // Response trimmed: no raw meta blob echoed.
    expect(result.content[0].text).not.toContain("blob");
  });

  it("NEEDS_INFO with tasks → status + tasks + threadId echoed", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-2", threadId: "t-2", status: "working" }),
    );
    get.mockResolvedValue(
      ok({
        status: "completed",
        threadId: "t-2",
        replyMarkdown:
          '1. Check deploy log\n<!-- tfa-status: {"status":"NEEDS_INFO","confidence":"medium"} -->',
      }),
    );

    const result = await runWithTimers(
      tfaRcaTurnTool(
        { testRunId: "tr-2", message: "digest" },
        mockConfig as any,
      ),
    );
    const payload = JSON.parse(result.content[0].text as string);
    expect(payload.status).toBe("NEEDS_INFO");
    expect(payload.tasks).toEqual(["Check deploy log"]);
    expect(payload.threadId).toBe("t-2");
  });

  it("threadId passthrough → POST body carries thread_id", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-3", threadId: "t-1", status: "working" }),
    );
    get.mockResolvedValue(
      ok({ status: "completed", replyMarkdown: "## Final RCA\nok" }),
    );

    await runWithTimers(
      tfaRcaTurnTool(
        { testRunId: "tr-3", message: "digest", threadId: "t-1" },
        mockConfig as any,
      ),
    );

    expect(post).toHaveBeenCalledTimes(1);
    const body = post.mock.calls[0][0].body;
    expect(body.thread_id).toBe("t-1");
  });

  it("resume soft-PENDING → polls turnId without re-submitting", async () => {
    get.mockResolvedValue(
      ok({
        status: "completed",
        threadId: "t-9",
        replyMarkdown: "## Final RCA",
      }),
    );

    const result = await runWithTimers(
      tfaRcaTurnTool(
        { testRunId: "tr-9", message: "digest", turnId: "u-9" },
        mockConfig as any,
      ),
    );

    expect(post).not.toHaveBeenCalled();
    expect(get.mock.calls[0][0].url).toContain("/rcaChat/u-9");
    const payload = JSON.parse(result.content[0].text as string);
    expect(payload.status).toBe("RESOLVED");
  });

  it("poll returns failed → throws TfaRcaTurnError carrying upstream text", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-4", threadId: "t-4", status: "working" }),
    );
    get.mockResolvedValue(ok({ status: "failed", error: "agent crashed" }));

    await expect(
      runWithTimers(
        tfaRcaTurnTool(
          { testRunId: "tr-4", message: "digest" },
          mockConfig as any,
        ),
      ),
    ).rejects.toThrow("agent crashed");
  });

  it("poll 404 / expired → clean error, no raw axios throw", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-5", threadId: "t-5", status: "working" }),
    );
    get.mockResolvedValue(nonOk(404));

    await expect(
      runWithTimers(
        tfaRcaTurnTool(
          { testRunId: "tr-5", message: "digest" },
          mockConfig as any,
        ),
      ),
    ).rejects.toThrow("turn expired or not found");
  });

  it("consent denied → POST 403 → 'AI consent not enabled'", async () => {
    post.mockResolvedValue(nonOk(403));

    await expect(
      runWithTimers(
        tfaRcaTurnTool(
          { testRunId: "tr-6", message: "digest" },
          mockConfig as any,
        ),
      ),
    ).rejects.toThrow("AI consent not enabled for this group");
  });

  it("IDOR mismatch → POST 404 → 'test run not found', no existence leak", async () => {
    post.mockResolvedValue(nonOk(404));

    await expect(
      runWithTimers(
        tfaRcaTurnTool(
          { testRunId: "tr-7", message: "digest" },
          mockConfig as any,
        ),
      ),
    ).rejects.toThrow("test run not found for your group");
  });

  it("poll cap exceeded → deterministic soft PENDING with turnId/threadId", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-8", threadId: "t-8", status: "working" }),
    );
    get.mockResolvedValue(ok({ status: "working" }));

    const result = await runWithTimers(
      tfaRcaTurnTool(
        { testRunId: "tr-8", message: "digest" },
        mockConfig as any,
      ),
    );

    const payload = JSON.parse(result.content[0].text as string);
    expect(payload.status).toBe("PENDING");
    expect(payload.turnId).toBe("u-8");
    expect(payload.threadId).toBe("t-8");
  });

  it("base URL is o11y, not misc-services/localhost", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-b", threadId: "t-b", status: "working" }),
    );
    get.mockResolvedValue(
      ok({ status: "completed", replyMarkdown: "## Final RCA" }),
    );

    await runWithTimers(
      tfaRcaTurnTool(
        { testRunId: "tr-b", message: "digest" },
        mockConfig as any,
      ),
    );

    expect(post.mock.calls[0][0].url).toContain(
      "api-observability.browserstack.com",
    );
    expect(post.mock.calls[0][0].url).not.toContain("localhost");
    expect(get.mock.calls[0][0].url).toContain(
      "api-observability.browserstack.com",
    );
  });
});

// ---- Handler-level tests (instrumentation + isError envelope) ----

interface CapturedHandler {
  handler: (args: any, context: any) => Promise<any>;
}

function buildFakeServer(): { server: any; captured: CapturedHandler } {
  const captured: CapturedHandler = { handler: async () => ({}) };
  const server = {
    server: { getClientVersion: () => ({ name: "test", version: "1.0" }) },
    tool: (
      _name: string,
      _desc: string,
      _schema: any,
      handler: (args: any, context: any) => Promise<any>,
    ) => {
      captured.handler = handler;
      return {};
    },
  };
  return { server, captured };
}

describe("tfaRcaTurn handler instrumentation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("success → exactly one trackMCP with undefined error", async () => {
    post.mockResolvedValue(
      ok({ turnId: "u-1", threadId: "t-1", status: "working" }),
    );
    get.mockResolvedValue(
      ok({ status: "completed", replyMarkdown: "## Final RCA" }),
    );

    const { server, captured } = buildFakeServer();
    addTfaRcaCollaborationTools(server as any, mockConfig as any);

    const result = await runWithTimers(
      captured.handler({ testRunId: "tr-1", message: "d" }, undefined),
    );

    expect(result.isError).toBeFalsy();
    expect(trackMCP).toHaveBeenCalledTimes(1);
    expect((trackMCP as Mock).mock.calls[0][2]).toBeUndefined();
  });

  it("domain failure → isError envelope + trackMCP with error", async () => {
    post.mockResolvedValue(nonOk(403));

    const { server, captured } = buildFakeServer();
    addTfaRcaCollaborationTools(server as any, mockConfig as any);

    const result = await runWithTimers(
      captured.handler({ testRunId: "tr-1", message: "d" }, undefined),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(
      "AI consent not enabled for this group",
    );
    expect(trackMCP).toHaveBeenCalledTimes(1);
    expect((trackMCP as Mock).mock.calls[0][2]).toBeInstanceOf(Error);
  });

  it("missing creds → isError, no credential text in message", async () => {
    const getAuth = await import("../../src/lib/get-auth");
    (getAuth.getBrowserStackAuth as Mock).mockImplementationOnce(() => {
      throw new Error("Missing BrowserStack credentials");
    });

    const { server, captured } = buildFakeServer();
    addTfaRcaCollaborationTools(server as any, mockConfig as any);

    const result = await runWithTimers(
      captured.handler({ testRunId: "tr-1", message: "d" }, undefined),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("fake-key");
  });
});

describe("tfaRcaTurn timing constants sanity", () => {
  it("poll cap is larger than interval + initial delay", () => {
    expect(POLL_MAX_WAIT_MS).toBeGreaterThan(
      POLL_INITIAL_DELAY_MS + POLL_INTERVAL_MS,
    );
  });
  it("o11y base constant is the observability host", () => {
    expect(O11Y_BASE_URL).toBe("https://api-observability.browserstack.com");
  });
});
