// Helpers for handling an unreliable connection

// True when the phone can reach the internet
export function isOnlineState(state) {
  return Boolean(state?.isConnected) && state?.isInternetReachable !== false;
}

// Fails if the promise takes longer than ms, so the app doesn't hang on weak signal
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
