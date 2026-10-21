import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '../theme/theme';

// Shown instead of a list or chart when there's no data yet
export default function EmptyState({ icon = 'receipt-outline', title, message }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={colors.primarySoft} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  title: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.md, marginTop: spacing.sm },
  message: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
