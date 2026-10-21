import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Card from '../../components/Card';
import ChoiceChips from '../../components/ChoiceChips';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import OfflineNotice from '../../components/OfflineNotice';
import ScreenLayout from '../../components/ScreenLayout';
import TipRow from '../../components/TipRow';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { averageTipPercentage, filterByDateRange, rangeForFilter, totalTips } from '../../utils/calculations';
import { formatLongDate } from '../../utils/dates';
import { getDataErrorMessage } from '../../utils/errors';
import { formatPercent, formatRand } from '../../utils/format';

const FILTERS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All' },
];

/** One figure in the summary card. */
function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/**
 * The server's tip history, filtered by date range. Tap a tip (or its pencil)
 * to edit it, or use the bin icon to delete it.
 */
export default function HistoryScreen({ navigation }) {
  const { entries, loading, isOnline, pendingCount, removeTip } = useTips();
  const showToast = useToast();
  const [filter, setFilter] = useState('all');
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visibleEntries = useMemo(() => {
    const { start, end } = rangeForFilter(filter);
    return filterByDateRange(entries, start, end);
  }, [entries, filter]);

  const summary = useMemo(
    () => ({
      count: visibleEntries.length,
      total: totalTips(visibleEntries),
      average: averageTipPercentage(visibleEntries),
    }),
    [visibleEntries]
  );

  const openEntry = (entry) => {
    if (entry.synced === false) {
      showToast('This tip can be edited once it has synced.', 'info');
      return;
    }
    navigation.navigate('EditTip', { entryId: entry.id });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeTip(entryToDelete);
      showToast('Tip deleted.');
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
    } finally {
      setDeleting(false);
      setEntryToDelete(null);
    }
  };

  if (loading) return <LoadingView message="Loading your tips…" />;

  return (
    <ScreenLayout title="Tip history" scroll={false}>
      <FlatList
        data={visibleEntries}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <OfflineNotice isOnline={isOnline} pendingCount={pendingCount} />
            <ChoiceChips options={FILTERS} value={filter} onChange={setFilter} style={styles.filters} />
            <Card style={styles.summary}>
              <Stat label="Tips" value={String(summary.count)} />
              <Stat label="Total" value={formatRand(summary.total)} />
              <Stat label="Average" value={summary.average == null ? '-' : formatPercent(summary.average)} />
            </Card>
          </>
        }
        renderItem={({ item }) => (
          <TipRow entry={item} onPress={() => openEntry(item)} onDelete={() => setEntryToDelete(item)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={entries.length ? 'No tips in this period' : 'No tips yet'}
            message={entries.length ? 'Try a longer date range.' : 'Tips you log will be listed here.'}
          />
        }
      />

      <ConfirmDialog
        visible={Boolean(entryToDelete)}
        title="Delete this tip?"
        message={
          entryToDelete ? `The entry for ${formatLongDate(entryToDelete.shiftDate)} will be removed for good.` : ''
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl },
  filters: { marginBottom: spacing.lg },
  summary: { flexDirection: 'row', marginBottom: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontFamily: fonts.semiBold, fontSize: fontSizes.md },
  statLabel: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.xs },
});
