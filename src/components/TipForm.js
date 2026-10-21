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

// Converts a saved entry back into form text values
const formFromEntry = (entry) => ({
  shiftDate: entry.shiftDate,
  billAmount: entry.billAmount.toFixed(2),
  tipAmount: entry.tipAmount.toFixed(2),
  partySize: String(entry.partySize),
});

// Form for adding a new tip or editing an existing one
// Validates input, shows the tip % live, and passes values to onSubmit
// entry: existing tip to edit (leave out for a new tip)
// submitLabel: text on the save button
// onSubmit: async function, throw to keep the form as is
export default function TipForm({ entry, submitLabel = 'Save tip', onSubmit }) {
  const [form, setForm] = useState(() => (entry ? formFromEntry(entry) : emptyForm()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const bill = parseAmount(form.billAmount);
  const tip = parseAmount(form.tipAmount);
  const canShowPercentage = bill > 0 && tip >= 0 && tip <= bill;

  // Updates a field and clears its error when the user edits it
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
      if (!entry) setForm(emptyForm());
    } catch {
      // Screen already showed the error, so keep the user's input
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

      <AppButton title={submitLabel} onPress={handleSubmit} loading={saving} />
      {entry ? null : <Text style={styles.footnote}>No signal? The tip saves on your phone and syncs later.</Text>}
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
