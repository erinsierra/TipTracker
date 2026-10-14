import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import ChoiceChips from '../../components/ChoiceChips';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import OfflineNotice from '../../components/OfflineNotice';
import ScreenLayout from '../../components/ScreenLayout';
import SectionLabel from '../../components/SectionLabel';
import TipRow from '../../components/TipRow';
import TrendChart from '../../components/TrendChart';
import { DEFAULT_RESTAURANT, SA_NORM } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useTips } from '../../context/TipsContext';
import { colors, fontSizes, fonts, radius, spacing } from '../../theme/theme';
import {
  averageTipPercentage,
  buildTrend,
  compareToBenchmark,
  filterByDateRange,
  rangeForFilter,
  totalTips,
} from '../../utils/calculations';
import { formatPercent, formatRand } from '../../utils/format';

const TREND_MODES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

/** How each comparison result is worded and coloured. */
const COMPARISON_BADGES = {
  above: { label: 'Above benchmark', icon: 'caret-up', color: colors.success, background: colors.successSoft },
  near: { label: 'On benchmark', icon: 'remove', color: colors.success, background: colors.successSoft },
  below: { label: 'Below benchmark', icon: 'caret-down', color: colors.warning, background: colors.warningSoft },
};

const RECENT_COUNT = 5;

/**
 * Server home screen: this week's average tip against the benchmark,
 * the earnings trend chart and the most recent entries.
 */
export default function DashboardScreen({ navigation }) {
  const { displayName } = useAuth();
  const { entries, benchmark, loading, isOnline, pendingCount } = useTips();
  const [trendMode, setTrendMode] = useState('daily');

  const week = useMemo(() => {
    const { start, end } = rangeForFilter('7d');
    const weekEntries = filterByDateRange(entries, start, end);
    return { average: averageTipPercentage(weekEntries), total: totalTips(weekEntries), count: weekEntries.length };
  }, [entries]);

  const trend = useMemo(() => buildTrend(entries, trendMode), [entries, trendMode]);

  // Until an administrator calculates a local benchmark, compare against the SA norm.
  const benchmarkValue = benchmark?.averageTipPercentage ?? SA_NORM.suggested;
  const benchmarkLabel = benchmark
    ? `${DEFAULT_RESTAURANT.name} benchmark: ${formatPercent(benchmarkValue)}`
    : `SA norm: ${formatPercent(benchmarkValue)} (no local benchmark yet)`;
  const badge = COMPARISON_BADGES[compareToBenchmark(week.average, benchmarkValue)];

  if (loading) return <LoadingView message="Loading your tips…" />;

  return (
    <ScreenLayout title={`Hi, ${displayName.split(' ')[0]}`}>
      <OfflineNotice isOnline={isOnline} pendingCount={pendingCount} />

      <Card style={styles.summary}>
        <Text style={styles.summaryLabel}>{"This week's average tip"}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.average}>{week.average == null ? '-' : formatPercent(week.average)}</Text>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badge.background }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              <Ionicons name={badge.icon} size={14} color={badge.color} />
            </View>
          ) : null}
        </View>
        <Text style={styles.summaryLabel}>{benchmarkLabel}</Text>
        <Text style={styles.summaryDetail}>
          {week.count
            ? `${formatRand(week.total)} in tips from ${week.count} ${week.count === 1 ? 'entry' : 'entries'} in the last 7 days`
            : 'No tips logged in the last 7 days'}
        </Text>
      </Card>

      <SectionLabel>Earnings trend</SectionLabel>
      <ChoiceChips options={TREND_MODES} value={trendMode} onChange={setTrendMode} style={styles.modes} />
      <TrendChart data={trend} />

      <SectionLabel style={styles.recentLabel}>Recent entries</SectionLabel>
      {entries.length ? (
        entries.slice(0, RECENT_COUNT).map((entry) => <TipRow key={entry.id} entry={entry} />)
      ) : (
        <>
          <EmptyState title="No tips logged yet" message="Log your first tip to see your average and trend here." />
          <AppButton title="Log a tip" onPress={() => navigation.navigate('LogTip')} />
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: spacing.xl },
  summaryLabel: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  average: { color: colors.text, fontFamily: fonts.regular, fontSize: fontSizes.xxl },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: fontSizes.xs },
  summaryDetail: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.xs, marginTop: spacing.xs },
  modes: { marginBottom: spacing.lg },
  recentLabel: { marginTop: spacing.xl },
});
