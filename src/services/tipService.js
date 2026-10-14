/**
 * Tip entries (the TIP_ENTRY table in the ERD), stored in the tipEntries collection.
 * Module 1 of the app: create, read, update and delete.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { COLLECTIONS } from '../config/constants';
import { db } from '../config/firebase';
import { sortNewestFirst } from '../utils/calculations';

const tipsCollection = () => collection(db, COLLECTIONS.tipEntries);
const toEntry = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

/** Firestore allows at most 500 writes in one batch. */
const BATCH_LIMIT = 500;

/**
 * Generates a document id on the phone. Using our own id means an entry saved
 * offline keeps the same id when it syncs, so it can never be saved twice.
 */
export function newTipId() {
  return doc(tipsCollection()).id;
}

/** Create: saves a tip entry under the given id. */
export function saveTip(id, entry) {
  return setDoc(doc(tipsCollection(), id), { ...entry, synced: true });
}

/**
 * Read: listens to the signed-in server's entries, newest first.
 * `fromCache` is true when the result did not come from the server (offline).
 */
export function subscribeToTips(userId, onChange, onError) {
  const userTips = query(tipsCollection(), where('userId', '==', userId));
  return onSnapshot(
    userTips,
    (snapshot) => onChange(sortNewestFirst(snapshot.docs.map(toEntry)), snapshot.metadata.fromCache),
    onError
  );
}

/** Read (admin): every entry logged at a restaurant, used to calculate the benchmark. */
export async function fetchRestaurantTips(restaurantId) {
  const restaurantTips = query(tipsCollection(), where('restaurantId', '==', restaurantId));
  const snapshot = await getDocs(restaurantTips);
  return snapshot.docs.map(toEntry);
}

/** Update: changes the editable fields of an entry. */
export function updateTip(id, changes) {
  return updateDoc(doc(tipsCollection(), id), changes);
}

/** Delete: removes one entry. */
export function deleteTip(id) {
  return deleteDoc(doc(tipsCollection(), id));
}

/** Delete: removes every entry a user owns (used when an account is deleted). */
export async function deleteAllTipsForUser(userId) {
  const snapshot = await getDocs(query(tipsCollection(), where('userId', '==', userId)));
  for (let start = 0; start < snapshot.docs.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(start, start + BATCH_LIMIT).forEach((entry) => batch.delete(entry.ref));
    await batch.commit();
  }
}
