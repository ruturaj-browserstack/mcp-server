/**
 * Collaboration status emitted by the TFA agent for one RCA turn.
 * - NEEDS_INFO: TFA needs more digested input; the skill should execute the
 *   returned tasks/questions and submit another turn on the same thread.
 * - RESOLVED: an agreed root cause was reached; the loop stops.
 * - BLOCKED: TFA cannot proceed; the loop stops with a best-effort result.
 */
export enum TfaStatus {
  NEEDS_INFO = "NEEDS_INFO",
  RESOLVED = "RESOLVED",
  BLOCKED = "BLOCKED",
}

/**
 * Soft, tool-emitted status used when an in-call poll exceeds its wall-clock
 * cap. Not produced by the parser — produced by the turn util so the skill can
 * resume polling on a later turn via the optional `turnId` arg.
 */
export const PENDING_STATUS = "PENDING" as const;

/**
 * Normalized confidence representation. String enums (`low|medium|high`) and a
 * numeric form (e.g. `0.8`) both collapse to one of these buckets; anything
 * unrecognized or absent becomes `unknown`.
 */
export type Confidence = "low" | "medium" | "high" | "unknown";

/**
 * Result of parsing TFA's `reply_markdown` for collaboration state.
 */
export interface ParsedTfaStatus {
  status: TfaStatus;
  confidence: Confidence;
  /** Numbered or bulleted task lines pulled out of the reply prose. */
  tasks: string[];
  /** Interrogative lines pulled out of the reply prose. */
  questions: string[];
  /**
   * True when the status was inferred (marker absent or unparseable) rather
   * than read from the additive `<!-- tfa-status: {...} -->` marker.
   */
  inferred: boolean;
}

/**
 * Structured result returned by the turn util / tool. The raw o11y envelope and
 * `meta` blob are never echoed — only these fields cross the boundary.
 */
export interface TfaRcaTurnResult {
  status: TfaStatus | typeof PENDING_STATUS;
  confidence: Confidence;
  threadId?: string;
  turnId?: string;
  replyMarkdown?: string;
  tasks: string[];
  questions: string[];
}
