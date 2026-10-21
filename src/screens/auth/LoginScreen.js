import { useState } from 'react';
import { StyleSheet } from 'react-native';

import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import ScreenLayout from '../../components/ScreenLayout';
import { useToast } from '../../context/ToastContext';
import { getAuthErrorMessage, login } from '../../services/authService';
import { spacing } from '../../theme/theme';
import { validateEmail } from '../../utils/validation';

// Sign-in for returning servers, opens the dashboard on success
export default function LoginScreen({ navigation }) {
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const found = {};
    const emailError = validateEmail(email);
    if (emailError) found.email = emailError;
    if (!password) found.password = 'Enter your password.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Signed in. Welcome back!');
    } catch (error) {
      showToast(getAuthErrorMessage(error), 'error');
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Sign in" onBack={navigation.goBack}>
      <AppInput
        label="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <AppInput
        label="Password"
        placeholder="Your password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleLogin}
        error={errors.password}
      />

      <AppButton title="Sign in" onPress={handleLogin} loading={submitting} style={styles.submit} />
      <AppButton title="Create an account" variant="text" onPress={() => navigation.navigate('Register')} />
      <AppButton title="Forgot password?" variant="text" onPress={() => navigation.navigate('ForgotPassword')} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.sm, marginBottom: spacing.sm },
});
