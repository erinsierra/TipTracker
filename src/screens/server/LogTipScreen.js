import ScreenLayout from '../../components/ScreenLayout';
import TipForm from '../../components/TipForm';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { getDataErrorMessage } from '../../utils/errors';

/** Records a new tip entry, then returns to the dashboard, which updates immediately. */
export default function LogTipScreen({ navigation }) {
  const { addTip } = useTips();
  const showToast = useToast();

  const handleSubmit = async (form) => {
    try {
      const result = await addTip(form);
      if (result === 'queued') {
        showToast('No signal - entry saved on this phone. It will sync later.', 'info');
      } else {
        showToast('Tip entry saved.');
      }
      navigation.navigate('Dashboard');
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
      throw error;
    }
  };

  return (
    <ScreenLayout title="Log a tip">
      <TipForm
        submitLabel="Save entry"
        onSubmit={handleSubmit}
        footnote="No signal? Entry saves offline and syncs later"
      />
    </ScreenLayout>
  );
}
