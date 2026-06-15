import { describe, it, expect } from "vitest";
import { parseTfaStatus } from "../../src/tools/tfa-rca-utils/status-parser";
import { TfaStatus } from "../../src/tools/tfa-rca-utils/types";

describe("parseTfaStatus", () => {
  it("marker present (RESOLVED, high) → parsed, not inferred", () => {
    const body = `Root cause identified.\n<!-- tfa-status: {"status":"RESOLVED","confidence":"high"} -->`;
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.RESOLVED);
    expect(result.confidence).toBe("high");
    expect(result.inferred).toBe(false);
    expect(result.tasks).toEqual([]);
  });

  it("NEEDS_INFO marker + numbered task list → tasks parsed", () => {
    const body = [
      "I need more context:",
      "1. Check the deploy log for service X",
      "2. Confirm the pod restart count",
      `<!-- tfa-status: {"status":"NEEDS_INFO","confidence":"medium"} -->`,
    ].join("\n");
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.NEEDS_INFO);
    expect(result.confidence).toBe("medium");
    expect(result.inferred).toBe(false);
    expect(result.tasks).toEqual([
      "Check the deploy log for service X",
      "Confirm the pod restart count",
    ]);
  });

  it("BLOCKED marker without confidence → confidence unknown", () => {
    const body = `Cannot proceed.\n<!-- tfa-status: {"status":"BLOCKED"} -->`;
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.BLOCKED);
    expect(result.confidence).toBe("unknown");
    expect(result.inferred).toBe(false);
  });

  it("inference: marker absent + Final RCA heading → RESOLVED inferred", () => {
    const body = "## Final RCA\nThe deploy broke the config map.";
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.RESOLVED);
    expect(result.inferred).toBe(true);
  });

  it("inference: marker absent + no heading → NEEDS_INFO inferred", () => {
    const body = "Which service owns this endpoint?";
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.NEEDS_INFO);
    expect(result.inferred).toBe(true);
    expect(result.questions).toContain("Which service owns this endpoint?");
  });

  it("malformed marker JSON → does not throw, falls back to inference", () => {
    const body =
      "## Final RCA\nDetails.\n<!-- tfa-status: {status:RESOLVED -->";
    expect(() => parseTfaStatus(body)).not.toThrow();
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.RESOLVED); // from heading inference
    expect(result.inferred).toBe(true);
  });

  it("unknown status value → normalized to NEEDS_INFO, no crash", () => {
    const body = `text\n<!-- tfa-status: {"status":"WAT"} -->`;
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.NEEDS_INFO);
    expect(result.inferred).toBe(false);
  });

  it("empty reply → NEEDS_INFO, empty tasks/questions, no throw", () => {
    expect(() => parseTfaStatus("")).not.toThrow();
    const result = parseTfaStatus("");
    expect(result.status).toBe(TfaStatus.NEEDS_INFO);
    expect(result.tasks).toEqual([]);
    expect(result.questions).toEqual([]);
    expect(result.inferred).toBe(true);
  });

  it("null/undefined reply → NEEDS_INFO, no throw", () => {
    expect(() => parseTfaStatus(undefined)).not.toThrow();
    expect(() => parseTfaStatus(null)).not.toThrow();
    expect(parseTfaStatus(null).status).toBe(TfaStatus.NEEDS_INFO);
  });

  it("marker mid-document (not trailing) → still parsed", () => {
    const body = `intro\n<!-- tfa-status: {"status":"BLOCKED","confidence":"low"} -->\nmore prose after`;
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.BLOCKED);
    expect(result.confidence).toBe("low");
    expect(result.inferred).toBe(false);
  });

  it("confidence variants: string enums normalize", () => {
    const mk = (c: string) =>
      parseTfaStatus(
        `x\n<!-- tfa-status: {"status":"RESOLVED","confidence":"${c}"} -->`,
      ).confidence;
    expect(mk("low")).toBe("low");
    expect(mk("medium")).toBe("medium");
    expect(mk("high")).toBe("high");
  });

  it("confidence variants: numeric forms bucket", () => {
    const mk = (c: number) =>
      parseTfaStatus(
        `x\n<!-- tfa-status: {"status":"RESOLVED","confidence":${c}} -->`,
      ).confidence;
    expect(mk(0.2)).toBe("low");
    expect(mk(0.5)).toBe("medium");
    expect(mk(0.8)).toBe("high");
  });

  it("prose CONFIDENCE line scraped on inference path", () => {
    const body = "## Final RCA\nCONFIDENCE: high\nThe config map was deleted.";
    const result = parseTfaStatus(body);
    expect(result.status).toBe(TfaStatus.RESOLVED);
    expect(result.confidence).toBe("high");
    expect(result.inferred).toBe(true);
  });
});
