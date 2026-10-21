// User profiles, stored at users/{uid}
// Holds the server's name and role (server or admin)
// Only admins can see the A/B analytics
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import { COLLECTIONS, ROLES } from '../config/constants';
import { db } from '../config/firebase';

const userRef = (uid) => doc(db, COLLECTIONS.users, uid);

// New accounts start with the server role
export function createUserProfile(uid, { name, email }) {
  return setDoc(userRef(uid), { name, email, role: ROLES.server, createdAt: Date.now() });
}

// Listens for profile changes, returns a function to stop listening
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

// Read (admin): gets all user profiles, sorted by name
export async function fetchAllUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.users));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

// Update (admin): changes another user's role
export function updateUserRole(uid, role) {
  return updateDoc(userRef(uid), { role });
}
