import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ChoiceChips from '../components/ChoiceChips';
import ScreenLayout from '../components/ScreenLayout';
import SectionLabel from '../components/SectionLabel';
import { DISPLAY_VARIANTS, SA_NORM } from '../config/constants';
import { useToast } from '../context/ToastContext';
import { logCalculatorSession } from '../services/calculatorService';
import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';
import { calculateTipAmount, roundTo } from '../utils/calculations';
import { formatPercent, formatRand } from '../utils/format';
import { withTimeout } from '../utils/network';
import { parseAmount, validateAmount, validatePercentage } from '../utils/validation';

const CUSTOM = 'custom';
// Short time limit so logging never holds up the customer
const LOG_TIMEOUT_MS = 4000;

// Randomly picks display variant A or B (A/B test)
function pickVariant() {
  return Math.random() < 0.5 ? DISPLAY_VARIANTS.A : DISPLAY_VARIANTS.B;
}

// Customer tip calculator, no account needed
// Quick options follow the SA norm, "Other" allows any percentage
// Tapping Done saves an anonymous session for the A/B analytics
export default function CalculatorScreen({ navigation }) {
  const showToast = useToast();
  const [variant] = useState(pickVariant);
  const [billText, setBillText] = useState('');
  const [choice, setChoice] = useState(SA_NORM.suggested);
  const [customText, setCustomText] = useState('');
  const [errors, setErrors] = useState({});
  const [finishing, setFinishing] = useState(false);

  const bill = parseAmount(billText);
  const hasBill = bill > 0;
  const percentage = choice === CUSTOM ? parseAmount(customText) : choice;
  const hasPercentage = percentage >= 0 && percentage <= 100;
  const tip = hasBill && hasPercentage ? calculateTipAmount(bill, percentage) : 0;
  const total = hasBill ? roundTo(bill + tip) : 0;

  // Shows an error as soon as the input is invalid
  const billError = errors.bill ?? (billText.trim() ? validateAmount(billText, 'bill amount') : null);
  const customError = errors.custom ?? (choice === CUSTOM && customText.trim() ? validatePercentage(customText) : null);

  // Variant B also shows the rand amount and the SA norm
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
    const billProblem = validateAmount(billText, 'bill amount');
    if (billProblem) found.bill = billProblem;
    if (choice === CUSTOM) {
      const customProblem = validatePercentage(customText);
      if (customProblem) found.custom = customProblem;
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
      // Logging is just for stats, so failures aren't shown to the customer
    }
    setFinishing(false);
    showToast(`Tip ${formatRand(tip)} - total to pay ${formatRand(total)}. Thank you!`);
    navigation.goBack();
  };

  const clearErrors = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

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
          clearErrors('bill');
        }}
        error={billError}
      />

      <SectionLabel>Tip</SectionLabel>
      <ChoiceChips options={options} value={choice} onChange={setChoice} style={styles.chips} />
      {showAmounts ? (
        <Text style={styles.guide}>
          Most South Africans tip {SA_NORM.min}-{SA_NORM.max}% for table service.
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
            clearErrors('custom');
          }}
          error={customError}
        />
      ) : null}

      <View accessibilityLiveRegion="polite" style={styles.result}>
        <View style={styles.line}>
          <Text style={styles.lineText}>Bill</Text>
          <Text style={styles.lineText}>{formatRand(hasBill ? bill : 0)}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.lineText}>Tip ({hasPercentage ? formatPercent(percentage) : '-'})</Text>
          <Text style={styles.lineText}>{formatRand(tip)}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.totalLabel}>Total to pay</Text>
        <Text style={styles.total}>{formatRand(total)}</Text>
      </View>

      <AppButton title="Done" onPress={handleDone} loading={finishing} style={styles.done} />

    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  chips: { marginBottom: spacing.md },
  guide: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.lg },
  result: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  lineText: { color: colors.white, fontFamily: fonts.regular, fontSize: fontSizes.md },
  divider: { height: 1, backgroundColor: colors.primarySoft, marginVertical: spacing.md },
  totalLabel: { color: colors.white, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  total: { color: colors.white, fontFamily: fonts.semiBold, fontSize: fontSizes.xxl },
  done: { marginTop: spacing.xl },
  note: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
