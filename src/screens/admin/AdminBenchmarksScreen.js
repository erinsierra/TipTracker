import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import ChoiceChips from '../../components/ChoiceChips';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import ScreenLayout from '../../components/ScreenLayout';
import SectionLabel from '../../components/SectionLabel';
import { DEFAULT_RESTAURANT } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  calculateBenchmark,
  deleteBenchmark,
  subscribeToBenchmarks,
  updateBenchmark,
} from '../../services/benchmarkService';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { rangeForFilter } from '../../utils/calculations';
import { formatShortDate } from '../../utils/dates';
import { getDataErrorMessage } from '../../utils/errors';
import { formatPercent } from '../../utils/format';
import { parseAmount, validatePercentage } from '../../utils/validation';

const PERIODS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

/**
 * Administrator screen for benchmark data: calculate a new benchmark from
 * the tip entries, correct a figure, or delete one. Servers and customers
 * always see the newest benchmark.
 */
export default function AdminBenchmarksScreen({ navigation }) {
  const { restaurantId } = useAuth();
  const showToast = useToast();

  const [benchmarks, setBenchmarks] = useState(null); // null while loading
  const [period, setPeriod] = useState('30d');
  const [calculating, setCalculating] = useState(false);
  const [editing, setEditing] = useState(null); // benchmark being corrected
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState(null);
  const [deleting, setDeleting] = useState(null); // benchmark awaiting delete confirmation
  const [working, setWorking] = useState(false);

  useEffect(
    () =>
      subscribeToBenchmarks(restaurantId, setBenchmarks, (error) => {
        setBenchmarks([]);
        showToast(getDataErrorMessage(error), 'error');
      }),
    [restaurantId, showToast]
  );

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const { start, end } = rangeForFilter(period);
      const created = await calculateBenchmark({ restaurantId, periodStart: start, periodEnd: end });
      showToast(
        `Benchmark updated to ${formatPercent(created.averageTipPercentage)} from ${created.entryCount} entries.`
      );
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
    } finally {
      setCalculating(false);
    }
  };

  const startEditing = (benchmark) => {
    setEditing(benchmark);
    setEditText(String(benchmark.averageTipPercentage));
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    const error = validatePercentage(editText);
    setEditError(error);
    if (error) return;

    setWorking(true);
    try {
      await updateBenchmark(editing.id, parseAmount(editText));
      showToast('Benchmark corrected.');
      setEditing(null);
    } catch (saveError) {
      showToast(getDataErrorMessage(saveError), 'error');
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    setWorking(true);
    try {
      await deleteBenchmark(deleting.id);
      showToast('Benchmark deleted.');
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
    } finally {
      setWorking(false);
      setDeleting(null);
    }
  };

  if (!benchmarks) return <LoadingView message="Loading benchmarks…" />;

  return (
    <ScreenLayout title="Benchmarks" onBack={navigation.goBack}>
      <SectionLabel>Recalculate from tip entries</SectionLabel>
      <Text style={styles.help}>
        Averages every tip logged at {DEFAULT_RESTAURANT.name} in the period. Only the average is stored, never who
        earned what.
      </Text>
      <ChoiceChips options={PERIODS} value={period} onChange={setPeriod} style={styles.periods} />
      <AppButton title="Recalculate benchmark" onPress={handleCalculate} loading={calculating} />

      <SectionLabel style={styles.listLabel}>Saved benchmarks</SectionLabel>
      {benchmarks.length ? (
        benchmarks.map((benchmark, index) => (
          <View key={benchmark.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                {formatPercent(benchmark.averageTipPercentage)}
                {index === 0 ? '  (current)' : ''}
              </Text>
              <Text style={styles.rowSubtitle}>
                {formatShortDate(benchmark.periodStart)} to {formatShortDate(benchmark.periodEnd)} ·{' '}
                {benchmark.entryCount} entries · {benchmark.source === 'manual' ? 'corrected by hand' : 'calculated'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Correct this benchmark"
              hitSlop={8}
              onPress={() => startEditing(benchmark)}
              style={styles.icon}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete this benchmark"
              hitSlop={8}
              onPress={() => setDeleting(benchmark)}
              style={styles.icon}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </View>
        ))
      ) : (
        <EmptyState
          icon="analytics-outline"
          title="No benchmark yet"
          message="Until one is calculated, the app compares tips against the South African norm."
        />
      )}

      <ConfirmDialog
        visible={Boolean(editing)}
        title="Correct benchmark"
        message="Enter the average tip percentage for this period."
        confirmLabel="Save"
        loading={working}
        onConfirm={handleSaveEdit}
        onCancel={() => setEditing(null)}
      >
        <AppInput
          label="Average tip (%)"
          keyboardType="decimal-pad"
          value={editText}
          onChangeText={(value) => {
            setEditText(value);
            setEditError(null);
          }}
          error={editError}
        />
      </ConfirmDialog>

      <ConfirmDialog
        visible={Boolean(deleting)}
        title="Delete this benchmark?"
        message="If it is the current benchmark, the app falls back to the one before it."
        confirmLabel="Delete"
        destructive
        loading={working}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  help: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.md },
  periods: { marginBottom: spacing.lg },
  listLabel: { marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.md },
  rowSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.xs },
  icon: { paddingLeft: spacing.lg, paddingVertical: spacing.sm },
});
