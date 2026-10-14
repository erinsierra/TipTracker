import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '../theme/theme';
import { formatShortDate } from '../utils/dates';
import { formatPercent, formatRand } from '../utils/format';

/**
 * One tip entry in a list. Entries still waiting to sync are marked.
 * @param {Function} onPress optional - opens the entry for editing
 * @param {Function} onDelete optional - shows a delete button
 */
export default function TipRow({ entry, onPress, onDelete }) {
  const waitingToSync = entry.synced === false;
  const summary = `${formatShortDate(entry.shiftDate)}, ${entry.shift} shift, tip ${formatRand(entry.tipAmount)}`;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLabel={onPress ? `${summary}. Tap to edit.` : summary}
        disabled={!onPress}
        onPress={onPress}
        style={styles.main}
      >
        <View style={styles.details}>
          <Text style={styles.title}>
            {formatShortDate(entry.shiftDate)} - {entry.shift}
          </Text>
          <Text style={styles.subtitle}>
            Bill {formatRand(entry.billAmount)} · {formatPercent(entry.tipPercentage)} · party of {entry.partySize}
          </Text>
          {waitingToSync ? (
            <View style={styles.syncTag}>
              <Ionicons name="cloud-offline-outline" size={14} color={colors.warning} />
              <Text style={styles.syncText}>Waiting to sync</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.amount}>{formatRand(entry.tipAmount)}</Text>
      </Pressable>

      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete entry for ${formatShortDate(entry.shiftDate)}`}
          hitSlop={10}
          onPress={onDelete}
          style={styles.delete}
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, minHeight: 56 },
  details: { flex: 1, paddingRight: spacing.sm },
  title: { color: colors.text, fontFamily: fonts.regular, fontSize: fontSizes.md },
  subtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.xs },
  amount: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.md },
  syncTag: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  syncText: { color: colors.warning, fontFamily: fonts.regular, fontSize: fontSizes.xs },
  delete: { paddingLeft: spacing.lg, paddingVertical: spacing.md },
});
