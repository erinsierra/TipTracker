import { useEffect } from 'react';

import ScreenLayout from '../../components/ScreenLayout';
import TipForm from '../../components/TipForm';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { getDataErrorMessage } from '../../utils/errors';

/** Changes an existing tip. Opened by tapping a tip in the history. */
export default function EditTipScreen({ navigation, route }) {
  const { entries, editTip } = useTips();
  const showToast = useToast();

  const entry = entries.find((item) => item.id === route.params.entryId);

  // If the tip disappears (for example, it was deleted), leave the screen.
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
