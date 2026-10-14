import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import LoadingView from '../../components/LoadingView';
import ScreenLayout from '../../components/ScreenLayout';
import { DISPLAY_VARIANTS } from '../../config/constants';
import { useToast } from '../../context/ToastContext';
import { fetchCalculatorSessions } from '../../services/calculatorService';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { summariseSessions } from '../../utils/calculations';
import { getDataErrorMessage } from '../../utils/errors';
import { formatPercent, formatRand } from '../../utils/format';

const VARIANTS = Object.values(DISPLAY_VARIANTS);
const VARIANT_IDS = VARIANTS.map((variant) => variant.id);

/** A label and figure inside a variant card. */
function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

/**
 * Administrator screen showing how the two tip-display variants perform,
 * using the anonymous sessions recorded by the customer calculator.
 */
export default function AdminAnalyticsScreen({ navigation }) {
  const showToast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [refreshCount, setRefreshCount] = useState(0);

  // Loads the sessions when the screen opens and again each time Refresh is pressed.
  useEffect(() => {
    let active = true;
    fetchCalculatorSessions()
      .then((sessions) => {
        if (active) setSummary(summariseSessions(sessions, VARIANT_IDS));
      })
      .catch((error) => {
        if (active) showToast(getDataErrorMessage(error), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshCount, showToast]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshCount((count) => count + 1);
  };

  if (loading && !summary) return <LoadingView message="Loading analytics…" />;

  return (
    <ScreenLayout title="A/B analytics" onBack={navigation.goBack}>
      <Text style={styles.intro}>
        Each customer is randomly shown one of two tip displays. These figures compare what customers then chose.
      </Text>

      {VARIANTS.map((variant) => {
        const result = summary?.[variant.id];
        return (
          <Card key={variant.id} style={styles.card}>
            <Text style={styles.variantName}>
              Variant {variant.id}: {variant.name}
            </Text>
            <Text style={styles.variantDescription}>{variant.description}</Text>
            <Metric label="Calculator sessions" value={result ? String(result.sessions) : '-'} />
            <Metric
              label="Average tip chosen"
              value={result?.averageSelected == null ? '-' : formatPercent(result.averageSelected)}
            />
            <Metric
              label="Kept the suggested tip"
              value={result?.keptSuggestion == null ? '-' : `${result.keptSuggestion}%`}
            />
            <Metric label="Average bill" value={result?.averageBill == null ? '-' : formatRand(result.averageBill)} />
          </Card>
        );
      })}

      <AppButton title="Refresh" variant="outline" onPress={handleRefresh} loading={loading} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  variantName: { color: colors.text, fontFamily: fonts.semiBold, fontSize: fontSizes.md },
  variantDescription: {
    color: colors.primaryDark,
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    marginBottom: spacing.sm,
  },
  metric: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  metricLabel: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  metricValue: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.sm },
});
