/**
 * Reject a promise if it does not settle within `ms`. Used to bound AI calls
 * so a hung provider cannot stall the pipeline.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('AI request timed out')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Run `fn`, retrying up to `retries` additional times on failure (timeout,
 * malformed JSON, rate limit, empty response). Throws the last error if every
 * attempt fails. Callers mark the pipeline failed after this gives up.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  timeoutMs = 60_000,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}
