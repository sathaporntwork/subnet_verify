/** Discriminated union used by every parser: an error message or a value. */
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export type IpFamily = 'ipv4' | 'ipv6';

/**
 * Outcome of verifying a single input line.
 * - `valid`   — correct network prefix exactly as written
 * - `fixable` — parseable, but not a proper network prefix; an automatic fix is available
 * - `kept`    — user declined the suggested fix for this line
 * - `invalid` — cannot be parsed; manual correction required
 * - `empty`   — blank line, skipped
 */
export type PrefixStatus = 'valid' | 'fixable' | 'kept' | 'invalid' | 'empty';

export interface FixSuggestion {
  /** Canonical, corrected prefix to apply. */
  suggested: string;
  /** Human-readable reasons why the original was flagged. */
  reasons: string[];
}

/** Verification result for one line of the input. */
export interface LineResult {
  /** 1-based line number in the textarea. */
  line: number;
  /** Original text of the line, trimmed. */
  raw: string;
  status: PrefixStatus;
  family?: IpFamily;
  /** Canonical form shown when the input already denotes a proper network. */
  canonical?: string;
  fix?: FixSuggestion;
  /** Parse-failure explanation for invalid lines. */
  reason?: string;
}
