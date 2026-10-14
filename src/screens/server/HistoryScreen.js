import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import OfflineNotice from '../../components/OfflineNotice';
import ScreenLayout from '../../components/ScreenLayout';
import TipRow from '../../components/TipRow';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { averageTipPercentage, totalTips } from '../../utils/calculations';
import { formatLongDate } from '../../utils/dates';
import { getDataErrorMessage } from '../../utils/errors';
import { formatPercent, formatRand } from '../../utils/format';

/** One figure in the summary card. */
function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Every tip the server has logged, newest first, with totals. Use the bin icon to delete an entry. */
export default function HistoryScreen() {
  const { entries, loading, isOnline, pendingCount, removeTip } = useTips();
  const showToast = useToast();
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const summary = useMemo(
    () => ({ count: entries.length, total: totalTips(entries), average: averageTipPercentage(entries) }),
    [entries]
  );

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
        data={entries}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <OfflineNotice isOnline={isOnline} pendingCount={pendingCount} />
            <Card style={styles.summary}>
              <Stat label="Tips" value={String(summary.count)} />
              <Stat label="Total" value={formatRand(summary.total)} />
              <Stat label="Average" value={summary.average == null ? '-' : formatPercent(summary.average)} />
            </Card>
          </>
        }
        renderItem={({ item }) => <TipRow entry={item} onDelete={() => setEntryToDelete(item)} />}
        ListEmptyComponent={<EmptyState title="No tips yet" message="Tips you log will be listed here." />}
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
  summary: { flexDirection: 'row', marginBottom: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontFamily: fonts.semiBold, fontSize: fontSizes.md },
  statLabel: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.xs },
});
