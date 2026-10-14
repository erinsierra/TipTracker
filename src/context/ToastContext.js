/**
 * App-wide feedback messages. Any screen can call showToast() to confirm
 * that an action worked or explain why it failed.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

const VISIBLE_MS = 3500;

const STYLES_BY_TYPE = {
  success: { backgroundColor: colors.success, icon: 'checkmark-circle' },
  error: { backgroundColor: colors.danger, icon: 'alert-circle' },
  info: { backgroundColor: colors.text, icon: 'information-circle' },
};

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const hideTimer = useRef(null);
  const insets = useSafeAreaInsets();

  /** @param {string} message @param {'success' | 'error' | 'info'} type */
  const showToast = useCallback(
    (message, type = 'success') => {
      clearTimeout(hideTimer.current);
      setToast({ message, type });
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
      }, VISIBLE_MS);
    },
    [opacity]
  );

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const look = toast ? STYLES_BY_TYPE[toast.type] : null;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Animated.View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          pointerEvents="none"
          style={[styles.toast, { opacity, top: insets.top + spacing.sm, backgroundColor: look.backgroundColor }]}
        >
          <Ionicons name={look.icon} size={22} color={colors.white} />
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

/** Returns showToast(message, type). */
export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  message: { flex: 1, color: colors.white, fontFamily: fonts.medium, fontSize: fontSizes.sm },
});
