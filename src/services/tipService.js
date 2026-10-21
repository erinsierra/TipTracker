/**
 * Tip entries, stored in the tipEntries collection.
 * Each entry: userId, shiftDate, billAmount, tipAmount, partySize, tipPercentage, createdAt, synced.
 */
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, where, writeBatch, updateDoc } from 'firebase/firestore';

import { COLLECTIONS } from '../config/constants';
import { db } from '../config/firebase';
import { sortNewestFirst } from '../utils/calculations';

const tipsCollection = () => collection(db, COLLECTIONS.tipEntries);

/** Firestore allows at most 500 writes in one batch. */
const BATCH_LIMIT = 500;

/**
 * Generates a document id on the phone. An entry saved offline keeps the same id
 * when it syncs, so it can never be saved twice.
 */
export function newTipId() {
  return doc(tipsCollection()).id;
}

/** Saves a tip entry under the given id. */
export function saveTip(id, entry) {
  return setDoc(doc(tipsCollection(), id), { ...entry, synced: true });
}

/**
 * Listens to the signed-in server's entries, newest first.
 * `fromCache` is true when the result did not come from the server (offline).
 */
export function subscribeToTips(userId, onChange, onError) {
  const userTips = query(tipsCollection(), where('userId', '==', userId));
  return onSnapshot(
    userTips,
    (snapshot) =>
      onChange(
        sortNewestFirst(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        snapshot.metadata.fromCache
      ),
    onError
  );
}
/** Changes an entry that is already saved. */
export function updateTip(id, changes) {
  return updateDoc(doc(tipsCollection(), id), changes);
}

/** Removes one entry. */
export function deleteTip(id) {
  return deleteDoc(doc(tipsCollection(), id));
}

/** Removes every entry a user owns (used when an account is deleted). */
export async function deleteAllTipsForUser(userId) {
  const snapshot = await getDocs(query(tipsCollection(), where('userId', '==', userId)));
  for (let start = 0; start < snapshot.docs.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(start, start + BATCH_LIMIT).forEach((entry) => batch.delete(entry.ref));
    await batch.commit();
  }
}
