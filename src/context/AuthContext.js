/**
 * Holds the signed-in user and their profile for the whole app.
 * Navigation reads this to decide between the public and the server screens.
 */
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_RESTAURANT, ROLES } from '../config/constants';
import { auth } from '../config/firebase';
import { subscribeToUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialising, setInitialising] = useState(true);

  // Firebase restores a saved session on launch, then reports every login and logout.
  useEffect(
    () =>
      onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) setProfile(null);
        setInitialising(false);
      }),
    []
  );

  // Keep the profile (name, role, restaurant) in step with the database.
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
      restaurantId: profile?.restaurantId ?? DEFAULT_RESTAURANT.id,
      isAdmin: profile?.role === ROLES.admin,
    }),
    [user, profile, initialising]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
