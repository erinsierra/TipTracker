import { StyleSheet, Text } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '../theme/theme';

/** The small grey upper-case heading used above each group of content. */
export default function SectionLabel({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});
