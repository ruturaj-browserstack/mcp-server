import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { fetchSelfHealSelectorTool } from "../../src/tools/selfheal";
import { getSelfHealSelectors } from "../../src/tools/selfheal-utils/selfheal";

vi.mock("../../src/tools/selfheal-utils/selfheal", () => ({
  getSelfHealSelectors: vi.fn(),
}));
vi.mock("../../src/logger", () => ({
  default: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../src/lib/instrumentation", () => ({ trackMCP: vi.fn() }));

const mockConfig = {
  "browserstack-username": "fake-user",
  "browserstack-access-key": "fake-key",
};

describe("fetchSelfHealSelectorTool", () => {
  beforeEach(() => vi.clearAllMocks());

  it("SUCCESS: returns self-heal selectors", async () => {
    const mockSelectors = [
      { original: "#old-id", healed: ".new-class", confidence: 0.95 },
    ];
    (getSelfHealSelectors as Mock).mockResolvedValue(mockSelectors);

    const result = await fetchSelfHealSelectorTool(
      { sessionId: "sess-123" },
      mockConfig,
    );

    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain("Self-heal selectors fetched");
    expect(result.content[0].text).toContain("old-id");
  });

  it("FAIL: returns isError on API failure", async () => {
    (getSelfHealSelectors as Mock).mockRejectedValue(
      new Error("Session not found"),
    );

    const result = await fetchSelfHealSelectorTool(
      { sessionId: "invalid" },
      mockConfig,
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error");
  });
});
