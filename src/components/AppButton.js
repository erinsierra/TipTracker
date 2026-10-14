import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { TOUCH_TARGET, colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

/**
 * The app's button.
 * @param {'primary' | 'outline' | 'text' | 'danger'} variant visual style
 * @param {boolean} loading shows a spinner and blocks repeat taps while work is in progress
 */
export default function AppButton({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const isFilled = variant === 'primary' || variant === 'danger';
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.label, !isFilled && styles.labelOnLight, variant === 'text' && styles.labelText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_TARGET,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  outline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  text: { minHeight: 44 },
  pressed: { opacity: 0.8 },
  inactive: { opacity: 0.6 },
  label: { color: colors.white, fontFamily: fonts.medium, fontSize: fontSizes.md },
  labelOnLight: { color: colors.primary },
  labelText: { fontSize: fontSizes.sm },
});
