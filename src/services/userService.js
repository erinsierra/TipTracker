/**
 * User profiles, stored at users/{uid}. The profile holds the server's name
 * and their role (server or admin). Only the role decides who sees the A/B analytics.
 */
import { deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

import { COLLECTIONS, ROLES } from '../config/constants';
import { db } from '../config/firebase';

const userRef = (uid) => doc(db, COLLECTIONS.users, uid);

/** Every new account starts as a server. */
export function createUserProfile(uid, { name, email }) {
  return setDoc(userRef(uid), { name, email, role: ROLES.server, createdAt: Date.now() });
}

/** Listens for profile changes. Returns the function that stops listening. */
export function subscribeToUserProfile(uid, onChange, onError) {
  return onSnapshot(
    userRef(uid),
    (snapshot) => onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError
  );
}

export function deleteUserProfile(uid) {
  return deleteDoc(userRef(uid));
}
