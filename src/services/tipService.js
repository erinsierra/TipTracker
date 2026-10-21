// Tip entries, stored in the tipEntries collection
// Each entry: userId, shiftDate, billAmount, tipAmount, partySize, tipPercentage, createdAt, synced
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, where, writeBatch, updateDoc } from 'firebase/firestore';

import { COLLECTIONS } from '../config/constants';
import { db } from '../config/firebase';
import { sortNewestFirst } from '../utils/calculations';

const tipsCollection = () => collection(db, COLLECTIONS.tipEntries);

// Firestore allows max 500 writes per batch
const BATCH_LIMIT = 500;

// Creates an id on the phone so offline entries keep the same id when synced
// This prevents saving the same entry twice
export function newTipId() {
  return doc(tipsCollection()).id;
}

// Saves a tip entry with the given id
export function saveTip(id, entry) {
  return setDoc(doc(tipsCollection(), id), { ...entry, synced: true });
}

// Listens to the server's entries, newest first
// fromCache is true when the data came from the phone (offline)
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
// Updates an existing entry
export function updateTip(id, changes) {
  return updateDoc(doc(tipsCollection(), id), changes);
}

// Deletes one entry
export function deleteTip(id) {
  return deleteDoc(doc(tipsCollection(), id));
}

// Deletes all of a user's entries (used when deleting an account)
export async function deleteAllTipsForUser(userId) {
  const snapshot = await getDocs(query(tipsCollection(), where('userId', '==', userId)));
  for (let start = 0; start < snapshot.docs.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(start, start + BATCH_LIMIT).forEach((entry) => batch.delete(entry.ref));
    await batch.commit();
  }
}
