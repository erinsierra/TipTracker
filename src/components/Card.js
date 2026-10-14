import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme/theme';

/** The cream panel used for summaries and totals. */
export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    padding: spacing.lg,
  },
});
