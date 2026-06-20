import { z } from "zod";

import appConfig from "../../config.js";

/**
 * O11y base for the `rcaChat` proxy. The MCP server talks ONLY to o11y-api
 * (boundary discipline, R9). The value is process-startup config resolved in
 * `src/config.ts` from `O11Y_TFA_RCA_BASE_URL` (default rengg-tfa) — never read
 * `process.env` here. Resolved per call so a config built per server instance
 * (multi-tenant) is honored.
 */
export function getO11yBaseUrl(): string {
  return appConfig.O11Y_TFA_RCA_BASE_URL;
}

/** Submit one collaborative turn for a test run. */
export const RCA_CHAT_SUBMIT_PATH = "/ext/v1/testRuns/{testRunId}/rcaChat";

/** Poll a submitted turn to completion. */
export const RCA_CHAT_POLL_PATH =
  "/ext/v1/testRuns/{testRunId}/rcaChat/{turnId}";

/** Initial wait before the first poll GET. */
export const POLL_INITIAL_DELAY_MS = 2000;

/** Interval between poll GETs. */
export const POLL_INTERVAL_MS = 3000;

/** Wall-clock cap for the in-call poll; exceeding it yields a soft PENDING. */
export const POLL_MAX_WAIT_MS = 90 * 1000;

/** Max length of the digest message, matching o11y's request `@Size`. */
export const MESSAGE_MAX_LENGTH = 5000;

/**
 * Zod param shapes for the `tfaRcaTurn` tool, exported as a
 * `Record<string, ZodType>` mirroring `rca-agent-utils/constants.ts`.
 * No credential fields (security rule). Each `.describe()` ≤ 60 chars.
 */
export const TFA_RCA_TURN_PARAMS = {
  testRunId: z.string().describe("Test run id to run RCA collaboration on."),
  message: z
    .string()
    .max(MESSAGE_MAX_LENGTH)
    .describe("Digested analysis to send this turn; no raw logs."),
  threadId: z
    .string()
    .optional()
    .describe("Thread id from prior turn; omit on first turn."),
  turnId: z
    .string()
    .optional()
    .describe("Turn id to resume a pending poll; usually omit."),
};
