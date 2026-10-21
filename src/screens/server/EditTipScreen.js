import { useEffect } from 'react';

import ScreenLayout from '../../components/ScreenLayout';
import TipForm from '../../components/TipForm';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { getDataErrorMessage } from '../../utils/errors';

// Edits an existing tip, opened by tapping a tip in history
export default function EditTipScreen({ navigation, route }) {
  const { entries, editTip } = useTips();
  const showToast = useToast();

  const entry = entries.find((item) => item.id === route.params.entryId);

  // Leaves the screen if the tip no longer exists (e.g. deleted)
  useEffect(() => {
    if (!entry) navigation.goBack();
  }, [entry, navigation]);

  if (!entry) return null;

  const handleSubmit = async (form) => {
    try {
      await editTip(entry.id, form);
      showToast('Tip updated.');
      navigation.goBack();
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
      throw error;
    }
  };

  return (
    <ScreenLayout title="Edit tip" onBack={navigation.goBack}>
      <TipForm entry={entry} submitLabel="Save changes" onSubmit={handleSubmit} />
    </ScreenLayout>
  );
}
