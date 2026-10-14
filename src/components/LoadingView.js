import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '../theme/theme';

/** A centred spinner with a short message, shown while data is loading. */
export default function LoadingView({ message = 'Loading…' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  message: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginTop: spacing.md },
});
