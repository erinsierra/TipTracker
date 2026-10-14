import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import Card from '../components/Card';
import ChoiceChips from '../components/ChoiceChips';
import ScreenLayout from '../components/ScreenLayout';
import SectionLabel from '../components/SectionLabel';
import { DEFAULT_RESTAURANT, DISPLAY_VARIANTS, SA_NORM } from '../config/constants';
import { useToast } from '../context/ToastContext';
import { fetchLatestBenchmark } from '../services/benchmarkService';
import { logCalculatorSession } from '../services/calculatorService';
import { getCachedBenchmark } from '../services/offlineQueue';
import { colors, fontSizes, fonts, spacing } from '../theme/theme';
import { calculateTipAmount, roundTo } from '../utils/calculations';
import { formatPercent, formatRand } from '../utils/format';
import { withTimeout } from '../utils/network';
import { parseAmount, validateAmount, validatePercentage } from '../utils/validation';

const CUSTOM = 'custom';
/** Usage logging must never hold a customer up, so it gets a short time limit. */
const LOG_TIMEOUT_MS = 4000;

/** Each customer is randomly shown one of the two display variants (A/B test). */
function pickVariant() {
  return Math.random() < 0.5 ? DISPLAY_VARIANTS.A : DISPLAY_VARIANTS.B;
}

/**
 * Customer tip calculator. No account is needed. The suggested tip follows
 * the South African norm, and the customer can change it before finishing.
 */
export default function CalculatorScreen({ navigation }) {
  const showToast = useToast();
  const [variant] = useState(pickVariant);
  const [benchmark, setBenchmark] = useState(null);
  const [billText, setBillText] = useState('');
  const [choice, setChoice] = useState(SA_NORM.suggested);
  const [customText, setCustomText] = useState('');
  const [errors, setErrors] = useState({});
  const [finishing, setFinishing] = useState(false);

  // Load the local benchmark. If there is no signal, use the last one saved on the phone.
  useEffect(() => {
    let active = true;
    fetchLatestBenchmark(DEFAULT_RESTAURANT.id)
      .catch(() => getCachedBenchmark())
      .then((latest) => active && setBenchmark(latest));
    return () => {
      active = false;
    };
  }, []);

  const bill = parseAmount(billText);
  const hasBill = bill > 0;
  const percentage = choice === CUSTOM ? parseAmount(customText) : choice;
  const hasPercentage = percentage >= 0 && percentage <= 100;
  const tip = hasBill && hasPercentage ? calculateTipAmount(bill, percentage) : 0;
  const total = hasBill ? roundTo(bill + tip) : 0;

  // Variant B adds the rand value under each percentage.
  const showAmounts = variant.id === DISPLAY_VARIANTS.B.id;
  const options = [
    ...variant.suggestedPercentages.map((value) => ({
      value,
      label: formatPercent(value),
      caption: showAmounts && hasBill ? formatRand(calculateTipAmount(bill, value)) : undefined,
    })),
    { value: CUSTOM, label: 'Other' },
  ];

  const handleDone = async () => {
    const found = {};
    const billError = validateAmount(billText, 'bill amount');
    if (billError) found.bill = billError;
    if (choice === CUSTOM) {
      const customError = validatePercentage(customText);
      if (customError) found.custom = customError;
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    setFinishing(true);
    try {
      await withTimeout(
        logCalculatorSession({
          displayVariantId: variant.id,
          billAmount: bill,
          suggestedPercentage: SA_NORM.suggested,
          selectedPercentage: percentage,
        }),
        LOG_TIMEOUT_MS
      );
    } catch {
      // Logging is only for anonymous statistics, so a failure is not shown to the customer.
    }
    setFinishing(false);
    showToast(`Tip ${formatRand(tip)} - total to pay ${formatRand(total)}. Thank you!`);
    navigation.goBack();
  };

  return (
    <ScreenLayout title="Tip calculator" onBack={navigation.goBack}>
      <AppInput
        label="Bill amount (R)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        autoFocus
        value={billText}
        onChangeText={(value) => {
          setBillText(value);
          setErrors((current) => ({ ...current, bill: undefined }));
        }}
        error={errors.bill}
      />

      <SectionLabel>Suggested tip - SA norm</SectionLabel>
      <ChoiceChips options={options} value={choice} onChange={setChoice} style={styles.chips} />
      {showAmounts ? (
        <Text style={styles.guide}>
          {benchmark
            ? `Servers at ${DEFAULT_RESTAURANT.name} average ${formatPercent(benchmark.averageTipPercentage)}, based on real tips logged here.`
            : `Most South Africans tip ${SA_NORM.min}-${SA_NORM.max}% for table service.`}
        </Text>
      ) : null}

      {choice === CUSTOM ? (
        <AppInput
          label="Your tip (%)"
          placeholder="e.g. 11"
          keyboardType="decimal-pad"
          value={customText}
          onChangeText={(value) => {
            setCustomText(value);
            setErrors((current) => ({ ...current, custom: undefined }));
          }}
          error={errors.custom}
        />
      ) : null}

      <Card style={styles.summary}>
        <View style={styles.line}>
          <Text style={styles.lineText}>Bill</Text>
          <Text style={styles.lineText}>{formatRand(hasBill ? bill : 0)}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.lineText}>Tip ({hasPercentage ? formatPercent(percentage) : '-'})</Text>
          <Text style={styles.lineText}>{formatRand(tip)}</Text>
        </View>
        <View accessibilityLiveRegion="polite" style={[styles.line, styles.totalLine]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>{formatRand(total)}</Text>
        </View>
      </Card>

      <AppButton title="Done" onPress={handleDone} loading={finishing} />
      <Text style={styles.note}>
        Suggestions use South African tipping norms, not overseas rates. Nothing that identifies you is saved.
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  chips: { marginBottom: spacing.md },
  guide: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.md },
  summary: { marginTop: spacing.sm, marginBottom: spacing.xl },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  lineText: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.md },
  totalLine: { borderTopWidth: 1.5, borderTopColor: colors.creamBorder, marginTop: spacing.sm, paddingTop: spacing.md },
  totalText: { color: colors.text, fontFamily: fonts.semiBold, fontSize: fontSizes.lg },
  note: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
