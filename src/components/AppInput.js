import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { TOUCH_TARGET, colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

// Text field with a label
// If there's an error, the border turns red and the message shows below
export default function AppInput({ label, error, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
        {...inputProps}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    backgroundColor: colors.white,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: fontSizes.xs, marginTop: spacing.xs },
});
