import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TOUCH_TARGET, colors, fontSizes, fonts, radius, spacing } from '../theme/theme';
import { addDays, formatLongDate, toDateKey } from '../utils/dates';

// Picks a shift date by moving one day back or forward
// Quicker than a calendar since most shifts are today or yesterday
// Future dates are blocked
export default function DateStepper({ value, onChange, error }) {
  const today = toDateKey();
  const isToday = value >= today;

  return (
    <View style={styles.field}>
      <View style={[styles.stepper, error && styles.stepperError]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          onPress={() => onChange(addDays(value, -1))}
          style={styles.arrow}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.date}>
          {value === today ? `Today, ${formatLongDate(value)}` : formatLongDate(value)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next day"
          accessibilityState={{ disabled: isToday }}
          disabled={isToday}
          onPress={() => onChange(addDays(value, 1))}
          style={[styles.arrow, isToday && styles.arrowDisabled]}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGET,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  stepperError: { borderColor: colors.danger },
  arrow: { width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  arrowDisabled: { opacity: 0.3 },
  date: { flex: 1, textAlign: 'center', color: colors.text, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: fontSizes.xs, marginTop: spacing.xs },
});
