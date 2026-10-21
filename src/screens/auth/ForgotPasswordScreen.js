import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import ScreenLayout from '../../components/ScreenLayout';
import { useToast } from '../../context/ToastContext';
import { getAuthErrorMessage, requestPasswordReset } from '../../services/authService';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { validateEmail } from '../../utils/validation';

// Screen for sending a password reset email.
export default function ForgotPasswordScreen({ navigation }) {
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Check the email, then ask Firebase to send the reset link
  const handleSend = async () => {
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      showToast('If that email has an account, a reset link is on its way.');
      navigation.goBack();
    } catch (resetError) {
      showToast(getAuthErrorMessage(resetError), 'error');
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Reset password" onBack={navigation.goBack}>
      <Text style={styles.intro}>
        Enter the email you registered with and we will send you a link to set a new password.
      </Text>
      <AppInput
        label="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError(null);
        }}
        onSubmitEditing={handleSend}
        error={error}
      />
      <AppButton title="Send reset link" onPress={handleSend} loading={submitting} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.lg },
});
