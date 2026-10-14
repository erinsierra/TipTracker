import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';
import { formatRand } from '../utils/format';

const CHART_HEIGHT = 120;
const MIN_BAR_HEIGHT = 3;

/**
 * A simple bar chart of tip earnings, drawn with plain Views so it needs no
 * chart library and runs on low-end phones.
 * @param {Array<{ key: string, label: string, total: number }>} data oldest bar first
 */
export default function TrendChart({ data }) {
  const highest = Math.max(...data.map((bar) => bar.total), 0);

  return (
    <View
      accessible
      accessibilityLabel={`Earnings chart. ${data.map((bar) => `${bar.label}: ${formatRand(bar.total)}`).join(', ')}`}
      style={styles.chart}
    >
      {data.map((bar) => {
        const height = highest ? Math.max((bar.total / highest) * CHART_HEIGHT, MIN_BAR_HEIGHT) : MIN_BAR_HEIGHT;
        return (
          <View key={bar.key} style={styles.column}>
            <Text style={styles.value}>{bar.total ? `R${Math.round(bar.total)}` : ''}</Text>
            <View style={[styles.bar, { height }, !bar.total && styles.barEmpty]} />
            <Text numberOfLines={1} style={styles.label}>
              {bar.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  value: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginBottom: 2 },
  bar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.sm / 2,
    borderTopRightRadius: radius.sm / 2,
  },
  barEmpty: { backgroundColor: colors.creamBorder },
  label: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.xs, marginTop: spacing.xs },
});
