import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { getSDKPrefixCommand } from "../../src/tools/sdk-utils/bstack/commands";

describe("getSDKPrefixCommand", () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

  afterEach(() => {
    if (originalPlatform) {
      Object.defineProperty(process, "platform", originalPlatform);
    }
  });

  beforeEach(() => {
    // Guard: ensure these env vars never leak into the rendered command.
    // The fix forwards `username` / `accessKey` parameters; reading process.env
    // would silently return undefined or a stale value in remote (multi-tenant) mode.
    delete process.env.BROWSERSTACK_USERNAME;
    delete process.env.BROWSERSTACK_ACCESS_KEY;
  });

  it("nodejs: embeds passed username/accessKey, never reads process.env", () => {
    const out = getSDKPrefixCommand("nodejs", "testng", "u-from-config", "k-from-config");
    expect(out).toContain("--username u-from-config");
    expect(out).toContain("--key k-from-config");
    expect(out).not.toContain("undefined");
    expect(out).not.toContain("process.env");
  });

  it("java/unix: Maven command uses passed username/accessKey", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    const out = getSDKPrefixCommand("java", "testng", "u-from-config", "k-from-config");
    expect(out).toContain('-DBROWSERSTACK_USERNAME="u-from-config"');
    expect(out).toContain('-DBROWSERSTACK_ACCESS_KEY="k-from-config"');
    expect(out).not.toContain("undefined");
    expect(out).not.toContain("process.env");
  });

  it("java/windows: Maven command uses passed username/accessKey (regression)", () => {
    // Regression for a bug where the Windows branch read process.env.BROWSERSTACK_*
    // while the Unix branch correctly took params. In remote mode this leaked the
    // string "undefined" into the Maven command shown to the user.
    Object.defineProperty(process, "platform", { value: "win32" });
    const out = getSDKPrefixCommand("java", "testng", "u-from-config", "k-from-config");
    expect(out).toContain('-DBROWSERSTACK_USERNAME="u-from-config"');
    expect(out).toContain('-DBROWSERSTACK_ACCESS_KEY="k-from-config"');
    expect(out).not.toContain("undefined");
    expect(out).not.toContain("process.env");
  });
});
