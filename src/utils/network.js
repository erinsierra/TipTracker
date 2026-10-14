/** Small helpers for working with an unreliable connection. */

/** True when a NetInfo state means the phone can reach the internet. */
export function isOnlineState(state) {
  return Boolean(state?.isConnected) && state?.isInternetReachable !== false;
}

/** Rejects if the promise takes longer than `ms`, so the app never hangs on a weak signal. */
export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('The request timed out.');
      error.code = 'network/timeout';
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
