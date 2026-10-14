/**
 * User profiles (the USER table in the ERD), stored at users/{uid}.
 * Module 2 of the app: create (on register), read, update and delete.
 */
import { deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import { COLLECTIONS, DEFAULT_RESTAURANT, ROLES } from '../config/constants';
import { db } from '../config/firebase';

const userRef = (uid) => doc(db, COLLECTIONS.users, uid);

/** Create: every new account starts as a server at the pilot restaurant. */
export function createUserProfile(uid, { name, email }) {
  return setDoc(userRef(uid), {
    restaurantId: DEFAULT_RESTAURANT.id,
    name,
    email,
    role: ROLES.server,
    createdAt: Date.now(),
  });
}

/** Read: listens for profile changes. Returns the function that stops listening. */
export function subscribeToUserProfile(uid, onChange, onError) {
  return onSnapshot(
    userRef(uid),
    (snapshot) => onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError
  );
}

/** Update: only the display name can be changed from the app. */
export function updateUserName(uid, name) {
  return updateDoc(userRef(uid), { name: name.trim() });
}

/** Delete: removes the profile document. */
export function deleteUserProfile(uid) {
  return deleteDoc(userRef(uid));
}
