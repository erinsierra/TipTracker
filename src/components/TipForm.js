import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, spacing } from '../theme/theme';
import { calculateTipPercentage } from '../utils/calculations';
import { toDateKey } from '../utils/dates';
import { formatPercent } from '../utils/format';
import { parseAmount, validateTipEntry } from '../utils/validation';
import AppButton from './AppButton';
import AppInput from './AppInput';
import Card from './Card';
import DateStepper from './DateStepper';
import SectionLabel from './SectionLabel';

const emptyForm = () => ({ shiftDate: toDateKey(), billAmount: '', tipAmount: '', partySize: '' });

/**
 * The "log a tip" form. It validates the input, works out the tip percentage
 * as the server types, and hands the values to `onSubmit`.
 *
 * @param {Function} onSubmit async (form) => void. Throw to keep the form as it is.
 */
export default function TipForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const bill = parseAmount(form.billAmount);
  const tip = parseAmount(form.tipAmount);
  const canShowPercentage = bill > 0 && tip >= 0 && tip <= bill;

  /** Updates one field and clears its error once the user starts fixing it. */
  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const found = validateTipEntry(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit(form);
      setForm(emptyForm());
    } catch {
      // The screen has already told the user what went wrong; keep their input.
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <SectionLabel>Shift date</SectionLabel>
      <DateStepper value={form.shiftDate} onChange={(value) => setField('shiftDate', value)} error={errors.shiftDate} />

      <AppInput
        label="Bill amount (R)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={form.billAmount}
        onChangeText={(value) => setField('billAmount', value)}
        error={errors.billAmount}
      />
      <AppInput
        label="Tip received (R)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={form.tipAmount}
        onChangeText={(value) => setField('tipAmount', value)}
        error={errors.tipAmount}
      />
      <AppInput
        label="Party size"
        placeholder="Number of people"
        keyboardType="number-pad"
        value={form.partySize}
        onChangeText={(value) => setField('partySize', value)}
        error={errors.partySize}
      />

      <Card style={styles.percentage}>
        <Text style={styles.percentageLabel}>Tip % (auto)</Text>
        <Text accessibilityLiveRegion="polite" style={styles.percentageValue}>
          {canShowPercentage ? formatPercent(calculateTipPercentage(bill, tip)) : '-'}
        </Text>
      </Card>

      <AppButton title="Save tip" onPress={handleSubmit} loading={saving} />
      <Text style={styles.footnote}>No signal? The tip saves on your phone and syncs later.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  percentage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  percentageLabel: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.md },
  percentageValue: { color: colors.primaryDark, fontFamily: fonts.semiBold, fontSize: fontSizes.lg },
  footnote: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
