// Keeps track of who is logged in and shares it with the whole app.
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ROLES } from '../config/constants';
import { auth } from '../config/firebase';
import { subscribeToUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialising, setInitialising] = useState(true);

  // Listen for login / logout (also restores a saved login on launch)
  useEffect(
    () =>
      onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) setProfile(null);
        setInitialising(false);
      }),
    []
  );

  // When someone is logged in, load their profile
  useEffect(() => {
    if (!user) return undefined;
    return subscribeToUserProfile(user.uid, setProfile, () => setProfile(null));
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      initialising,
      displayName: profile?.name ?? user?.displayName ?? 'Server',
      isAdmin: profile?.role === ROLES.admin,
    }),
    [user, profile, initialising]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
