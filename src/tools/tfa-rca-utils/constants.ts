import { z } from "zod";

/**
 * Hardcoded o11y base, mirroring `rca-agent-utils/rca-data.ts`. The MCP server
 * talks ONLY to o11y-api (boundary discipline, R9). Do NOT read
 * `BROWSERSTACK_TFA_CHAT_BASE_URL` or any `process.env` here — if a configurable
 * base is ever genuinely needed, add it to `src/config.ts`, never read env in
 * tool/util code.
 */
export const O11Y_BASE_URL = "https://api-observability.browserstack.com";

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
