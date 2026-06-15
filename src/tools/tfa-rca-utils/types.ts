/**
 * Collaboration status emitted by the TFA agent for one RCA turn.
 * - NEEDS_INFO: TFA needs more digested input; the skill should execute the
 *   returned asks/questions and submit another turn on the same thread.
 * - RESOLVED: an agreed root cause was reached (carries `rca`); the loop stops.
 * - BLOCKED: TFA cannot proceed; the loop stops with a best-effort result.
 */
export enum TfaStatus {
  NEEDS_INFO = "NEEDS_INFO",
  RESOLVED = "RESOLVED",
  BLOCKED = "BLOCKED",
}

/**
 * Soft, tool-emitted status used when an in-call poll exceeds its wall-clock
 * cap. Not produced by the agent — produced by the turn util so the skill can
 * resume polling on a later turn via the optional `turnId` arg.
 */
export const PENDING_STATUS = "PENDING" as const;

/**
 * Confidence the agent attaches to a turn. Mirrors the misc-services
 * `TurnResponse.confidence` Literal; PENDING turns carry `unknown`.
 */
export type Confidence = "low" | "medium" | "high" | "unknown";

/**
 * Evidence category the skill routes an ask to. Mirrors the misc-services
 * `Ask.evidence_type` Literal.
 */
export type EvidenceType =
  | "test_logs"
  | "product_code"
  | "k8s"
  | "kibana"
  | "metrics"
  | "deploy"
  | "ci"
  | "other";

/** A typed request for evidence; the skill routes it by `evidenceType`. */
export interface TfaAsk {
  what: string;
  why: string;
  evidenceType: EvidenceType;
  priority: "high" | "medium" | "low";
}

/**
 * The agreed root-cause analysis carried on a RESOLVED turn. Mirrors the
 * misc-services `TestFailureAnalysis` schema; passed through verbatim from the
 * o11y `rcaChat` response and never reshaped client-side.
 */
export interface TfaRca {
  root_cause?: string;
  description?: string;
  possible_fix?: string;
  failure_type?: string;
  alternatives_considered?: string[];
  related_prs?: unknown[];
  [key: string]: unknown;
}

/**
 * Structured turn the o11y `rcaChat` poll returns once `status === "completed"`.
 * Mirrors the misc-services `TurnResponse`; sub-objects are status-discriminated
 * (the agent's model validator guarantees the matching one is present).
 */
export interface TurnResponse {
  status: TfaStatus;
  confidence: Confidence;
  questions: string[];
  asks: TfaAsk[];
  suggestions: string[];
  hypotheses: string[];
  rca?: TfaRca;
  /** Present on BLOCKED turns: why TFA cannot proceed. */
  reason?: string;
  /** Present on BLOCKED turns: the asks that went unmet. */
  unmetAsks?: string[];
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
  questions: string[];
  asks: TfaAsk[];
  suggestions: string[];
  hypotheses: string[];
  rca?: TfaRca;
  reason?: string;
  unmetAsks?: string[];
}
