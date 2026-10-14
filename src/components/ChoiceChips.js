import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

/**
 * A row of options where one is selected (shift, tip percentage, filters).
 * @param {Array<{ value: any, label: string, caption?: string }>} options
 */
export default function ChoiceChips({ options, value, onChange, style }) {
  return (
    <View accessibilityRole="radiogroup" style={[styles.row, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.caption ? `${option.label}, ${option.caption}` : option.label}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.textSelected]}>{option.label}</Text>
            {option.caption ? (
              <Text style={[styles.caption, selected && styles.textSelected]}>{option.caption}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.primary },
  label: { color: colors.primary, fontFamily: fonts.medium, fontSize: fontSizes.md },
  caption: { color: colors.primary, fontFamily: fonts.regular, fontSize: fontSizes.xs },
  textSelected: { color: colors.white },
});
