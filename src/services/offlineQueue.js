/**
 * Offline support (FR13). Tips logged without signal wait in a queue on the
 * phone and are uploaded when the connection returns. The last known entries
 * and benchmark are also cached so the dashboard still opens offline.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveTip } from './tipService';

const pendingKey = (userId) => `tipTracker:pendingTips:${userId}`;
const entriesKey = (userId) => `tipTracker:cachedTips:${userId}`;
const BENCHMARK_KEY = 'tipTracker:cachedBenchmark';

async function readJson(key, fallback) {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const writeJson = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));

/** Entries that have not reached the cloud yet. */
export function getPendingTips(userId) {
  return readJson(pendingKey(userId), []);
}

/** Adds an entry to the queue and returns the updated queue. */
export async function addPendingTip(userId, entry) {
  const pending = await getPendingTips(userId);
  const updated = [...pending.filter((item) => item.id !== entry.id), { ...entry, synced: false }];
  await writeJson(pendingKey(userId), updated);
  return updated;
}

/** Removes an entry from the queue and returns the updated queue. */
export async function removePendingTip(userId, entryId) {
  const pending = await getPendingTips(userId);
  const updated = pending.filter((item) => item.id !== entryId);
  await writeJson(pendingKey(userId), updated);
  return updated;
}

/**
 * Uploads queued entries one at a time. Stops at the first failure so the
 * remaining entries stay queued for the next attempt.
 * @returns {{ uploaded: number, remaining: Array }}
 */
export async function syncPendingTips(userId) {
  let pending = await getPendingTips(userId);
  let uploaded = 0;

  for (const { id, synced, ...entry } of pending) {
    try {
      await saveTip(id, entry);
      pending = await removePendingTip(userId, id);
      uploaded += 1;
    } catch {
      break;
    }
  }
  return { uploaded, remaining: pending };
}

export const cacheTips = (userId, entries) => writeJson(entriesKey(userId), entries);
export const getCachedTips = (userId) => readJson(entriesKey(userId), []);

export const cacheBenchmark = (benchmark) => writeJson(BENCHMARK_KEY, benchmark);
export const getCachedBenchmark = () => readJson(BENCHMARK_KEY, null);

/** Clears everything stored on the phone for a user (used when an account is deleted). */
export function clearLocalData(userId) {
  return AsyncStorage.multiRemove([pendingKey(userId), entriesKey(userId)]);
}
