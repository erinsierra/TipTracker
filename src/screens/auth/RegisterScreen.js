import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import ScreenLayout from '../../components/ScreenLayout';
import { useToast } from '../../context/ToastContext';
import { getAuthErrorMessage, registerServer } from '../../services/authService';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from '../../utils/validation';

// Account creation for new servers
export default function RegisterScreen({ navigation }) {
  const showToast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmation: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleRegister = async () => {
    const checks = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmation: validatePasswordMatch(form.password, form.confirmation),
    };
    const found = Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await registerServer(form);
      showToast('Account created. Welcome to Tip Tracker!');
    } catch (error) {
      showToast(getAuthErrorMessage(error), 'error');
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Create account" onBack={navigation.goBack}>
      <AppInput
        label="Full name"
        placeholder="Your name"
        autoCapitalize="words"
        autoComplete="name"
        value={form.name}
        onChangeText={(value) => setField('name', value)}
        error={errors.name}
      />
      <AppInput
        label="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        value={form.email}
        onChangeText={(value) => setField('email', value)}
        error={errors.email}
      />
      <AppInput
        label="Password"
        placeholder="At least 8 characters, with a number"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        value={form.password}
        onChangeText={(value) => setField('password', value)}
        error={errors.password}
      />
      <AppInput
        label="Confirm password"
        placeholder="Type the password again"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        value={form.confirmation}
        onChangeText={(value) => setField('confirmation', value)}
        error={errors.confirmation}
      />

      <Text style={styles.note}>Only you can see your tip records.</Text>
      <AppButton title="Create account" onPress={handleRegister} loading={submitting} />
      <AppButton title="I already have an account" variant="text" onPress={navigation.goBack} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.lg },
});
