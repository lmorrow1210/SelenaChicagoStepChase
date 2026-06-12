// Exponential backoff with jitter for Health API 429s (plan §5):
// 1s → 2s → 4s → 8s → 16s (capped 32s), 5 tries total.

export class RetryableError extends Error {
  retryable = true as const;
}

export function isRetryable(err: unknown): boolean {
  if (err instanceof RetryableError) return true;
  const status = (err as { status?: number } | null)?.status;
  return status === 429 || status === 503;
}

export interface BackoffOptions {
  tries?: number;
  baseMs?: number;
  capMs?: number;
  /** Injected for tests; defaults to real sleep. */
  sleep?: (ms: number) => Promise<void>;
  /** Injected for tests; defaults to Math.random. */
  rand?: () => number;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Run `fn`, retrying retryable failures (429/503) with exponential backoff
 * and full jitter. Non-retryable errors rethrow immediately; the last
 * retryable error rethrows once tries are exhausted.
 */
export async function withBackoff<T>(fn: () => Promise<T>, opts: BackoffOptions = {}): Promise<T> {
  const tries = opts.tries ?? 5;
  const baseMs = opts.baseMs ?? 1000;
  const capMs = opts.capMs ?? 32000;
  const sleep = opts.sleep ?? realSleep;
  const rand = opts.rand ?? Math.random;

  let lastError: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err)) throw err;
      lastError = err;
      if (attempt < tries - 1) {
        const ceiling = Math.min(capMs, baseMs * 2 ** attempt);
        await sleep(Math.floor(rand() * ceiling) + 1);
      }
    }
  }
  throw lastError;
}
