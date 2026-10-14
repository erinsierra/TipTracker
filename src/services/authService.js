/**
 * Authentication: register, login, logout, password reset and account deletion.
 * Firebase Auth hashes the passwords and issues the session tokens, so the app
 * never stores a password itself.
 */
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { clearLocalData } from './offlineQueue';
import { deleteAllTipsForUser } from './tipService';
import { createUserProfile, deleteUserProfile } from './userService';

/** Creates the login and the matching profile document for a new server. */
export async function registerServer({ name, email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(user, { displayName: name.trim() });
  await createUserProfile(user.uid, { name: name.trim(), email: user.email });
  return user;
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logout() {
  return signOut(auth);
}

export function requestPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

/**
 * Permanently deletes the signed-in account and everything it owns.
 * Firebase needs a recent login for this, so the password is checked first.
 */
export async function deleteAccount(password) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  await deleteAllTipsForUser(user.uid);
  await deleteUserProfile(user.uid);
  await clearLocalData(user.uid);
  await deleteUser(user);
}

/** Turns a Firebase error into a message a server can act on. */
export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/weak-password':
      return 'That password is too weak. Use at least 8 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Check your signal and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
