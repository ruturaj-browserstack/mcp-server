import { Confidence, ParsedTfaStatus, TfaStatus } from "./types.js";

/**
 * The additive machine-readable status marker TFA may embed anywhere in its
 * reply, e.g. `<!-- tfa-status: {"status":"RESOLVED","confidence":"high"} -->`.
 * Located by regex (it may not be trailing). Changing the marker syntax is a
 * one-line edit here plus a fixture update — this is the single source of truth.
 */
const STATUS_MARKER_REGEX = /<!--\s*tfa-status:\s*(\{[\s\S]*?\})\s*-->/i;

/** Heading whose presence implies an agreed root cause when no marker exists. */
const FINAL_RCA_HEADING_REGEX = /^\s*#{1,6}\s*Final RCA\b/im;

/** Prose confidence line scraped on the inference path, e.g. `CONFIDENCE: high`. */
const PROSE_CONFIDENCE_REGEX = /CONFIDENCE\s*:\s*([A-Za-z0-9.]+)/i;

/** Map raw status strings to the enum; anything unknown falls back to NEEDS_INFO. */
const STATUS_NORMALIZATION: Record<string, TfaStatus> = {
  needs_info: TfaStatus.NEEDS_INFO,
  resolved: TfaStatus.RESOLVED,
  blocked: TfaStatus.BLOCKED,
};

function normalizeStatus(raw: unknown): TfaStatus {
  if (typeof raw !== "string") return TfaStatus.NEEDS_INFO;
  return STATUS_NORMALIZATION[raw.trim().toLowerCase()] ?? TfaStatus.NEEDS_INFO;
}

/**
 * Normalize confidence across string enums (`low|medium|high`) and a numeric
 * form (`0`..`1`) to a single representation. Unknown/absent → `unknown`.
 */
function normalizeConfidence(raw: unknown): Confidence {
  if (raw === undefined || raw === null) return "unknown";

  if (typeof raw === "number") return bucketNumericConfidence(raw);

  if (typeof raw === "string") {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed === "low" || trimmed === "medium" || trimmed === "high") {
      return trimmed;
    }
    const numeric = Number(trimmed);
    if (trimmed !== "" && !Number.isNaN(numeric)) {
      return bucketNumericConfidence(numeric);
    }
  }

  return "unknown";
}

function bucketNumericConfidence(value: number): Confidence {
  if (Number.isNaN(value)) return "unknown";
  if (value < 0.4) return "low";
  if (value < 0.7) return "medium";
  return "high";
}

/**
 * Pull numbered (`1.`, `1)`) or bulleted (`-`, `*`) task lines out of prose.
 * Question lines (ending in `?`) are excluded so they land in `questions`.
 */
function extractTasks(body: string): string[] {
  const tasks: string[] = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^(?:\d+[.)]|[-*])\s+(.*)$/);
    if (match) {
      const text = match[1].trim();
      if (text && !text.endsWith("?")) {
        tasks.push(text);
      }
    }
  }
  return tasks;
}

/** Pull interrogative lines (ending in `?`) out of prose. */
function extractQuestions(body: string): string[] {
  const questions: string[] = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^(?:\d+[.)]|[-*])\s+/, "");
    if (line.endsWith("?")) {
      questions.push(line);
    }
  }
  return questions;
}

/**
 * Extract collaboration status from TFA's reply markdown.
 *
 * Precedence:
 * 1. Marker path — a valid `<!-- tfa-status: {...} -->` anywhere in the body.
 * 2. Inference path (day-one primary) — a `## Final RCA` heading ⇒ RESOLVED,
 *    otherwise NEEDS_INFO; `inferred: true`.
 *
 * Never throws: a malformed marker JSON silently falls through to inference,
 * and empty/whitespace input yields NEEDS_INFO with empty task/question lists.
 */
export function parseTfaStatus(
  replyMarkdown: string | null | undefined,
): ParsedTfaStatus {
  const body = typeof replyMarkdown === "string" ? replyMarkdown : "";

  const tasks = extractTasks(body);
  const questions = extractQuestions(body);

  const markerMatch = body.match(STATUS_MARKER_REGEX);
  if (markerMatch) {
    try {
      const parsed = JSON.parse(markerMatch[1]) as Record<string, unknown>;
      return {
        status: normalizeStatus(parsed.status),
        confidence: normalizeConfidence(parsed.confidence),
        tasks,
        questions,
        inferred: false,
      };
    } catch {
      // Malformed marker JSON — fall through to inference, do not throw.
    }
  }

  const inferredStatus = FINAL_RCA_HEADING_REGEX.test(body)
    ? TfaStatus.RESOLVED
    : TfaStatus.NEEDS_INFO;

  const proseConfidence = body.match(PROSE_CONFIDENCE_REGEX);
  const confidence = proseConfidence
    ? normalizeConfidence(proseConfidence[1])
    : "unknown";

  return {
    status: inferredStatus,
    confidence,
    tasks,
    questions,
    inferred: true,
  };
}
