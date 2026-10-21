// Offline support
// Tips logged without signal are queued on the phone and uploaded when back online
// Recent entries are also cached so history still works offline
import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveTip } from './tipService';

const pendingKey = (userId) => `tipTracker:pendingTips:${userId}`;
const entriesKey = (userId) => `tipTracker:cachedTips:${userId}`;

async function readJson(key, fallback) {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const writeJson = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));

// Gets entries not yet uploaded to the cloud
export function getPendingTips(userId) {
  return readJson(pendingKey(userId), []);
}

// Adds an entry to the queue and returns the updated queue
export async function addPendingTip(userId, entry) {
  const pending = await getPendingTips(userId);
  const updated = [...pending.filter((item) => item.id !== entry.id), { ...entry, synced: false }];
  await writeJson(pendingKey(userId), updated);
  return updated;
}

// Removes an entry from the queue and returns the updated queue
export async function removePendingTip(userId, entryId) {
  const pending = await getPendingTips(userId);
  const updated = pending.filter((item) => item.id !== entryId);
  await writeJson(pendingKey(userId), updated);
  return updated;
}

// Uploads queued entries one by one
// Stops at the first failure so the rest stay queued for next time
// Returns { uploaded, remaining }
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

// Clears all local data for a user (used when deleting an account)
export function clearLocalData(userId) {
  return AsyncStorage.multiRemove([pendingKey(userId), entriesKey(userId)]);
}
