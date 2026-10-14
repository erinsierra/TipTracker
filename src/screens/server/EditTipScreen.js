import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import AppButton from '../../components/AppButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import ScreenLayout from '../../components/ScreenLayout';
import TipForm from '../../components/TipForm';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { spacing } from '../../theme/theme';
import { formatLongDate } from '../../utils/dates';
import { getDataErrorMessage } from '../../utils/errors';

/** Changes or deletes an existing tip entry. Opened from the history list. */
export default function EditTipScreen({ navigation, route }) {
  const { entries, editTip, removeTip } = useTips();
  const showToast = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const entry = entries.find((item) => item.id === route.params.entryId);

  // If the entry disappears (for example, deleted on another phone), leave the screen.
  useEffect(() => {
    if (!entry) navigation.goBack();
  }, [entry, navigation]);

  if (!entry) return null;

  const handleSubmit = async (form) => {
    try {
      await editTip(entry.id, form);
      showToast('Tip entry updated.');
      navigation.goBack();
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
      throw error;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeTip(entry);
      showToast('Tip entry deleted.');
      // The effect above closes the screen once the entry is gone.
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <ScreenLayout title="Edit entry" onBack={navigation.goBack}>
      <TipForm entry={entry} submitLabel="Save changes" onSubmit={handleSubmit} />
      <AppButton title="Delete entry" variant="text" onPress={() => setConfirmingDelete(true)} style={styles.delete} />

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this entry?"
        message={`The ${entry.shift.toLowerCase()} shift entry for ${formatLongDate(entry.shiftDate)} will be removed for good.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  delete: { marginTop: spacing.sm },
});
