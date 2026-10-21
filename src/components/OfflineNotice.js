import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

// Banner shown when the server is offline or has entries waiting to sync
export default function OfflineNotice({ isOnline, pendingCount }) {
  if (isOnline && !pendingCount) return null;

  const waiting = pendingCount === 1 ? '1 entry is' : `${pendingCount} entries are`;
  const message = !isOnline
    ? `You are offline.${pendingCount ? ` ${waiting} saved on this phone and will sync later.` : ' New tips will be saved on this phone.'}`
    : `${waiting} waiting to sync.`;

  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <Ionicons name={isOnline ? 'sync' : 'cloud-offline'} size={20} color={colors.warning} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  text: { flex: 1, color: colors.warning, fontFamily: fonts.regular, fontSize: fontSizes.sm },
});
