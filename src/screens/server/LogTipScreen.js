import ScreenLayout from '../../components/ScreenLayout';
import TipForm from '../../components/TipForm';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { getDataErrorMessage } from '../../utils/errors';

/** Records a new tip, then opens the history, which already includes it. */
export default function LogTipScreen({ navigation }) {
  const { addTip } = useTips();
  const showToast = useToast();

  const handleSubmit = async (form) => {
    try {
      const result = await addTip(form);
      if (result === 'queued') {
        showToast('No signal - tip saved on this phone. It will sync later.', 'info');
      } else {
        showToast('Tip saved.');
      }
      navigation.navigate('History');
    } catch (error) {
      //console.log('Log tip error:', error.code, error.message);
      showToast(getDataErrorMessage(error), 'error');
      throw error;
    }
  };

  return (
    <ScreenLayout title="Log a tip">
      <TipForm onSubmit={handleSubmit} />
    </ScreenLayout>
  );
}
