import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import ScreenLayout from '../../components/ScreenLayout';
import SectionLabel from '../../components/SectionLabel';
import { DEFAULT_RESTAURANT } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { deleteAccount, getAuthErrorMessage, logout, requestPasswordReset } from '../../services/authService';
import { updateUserName } from '../../services/userService';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { getDataErrorMessage } from '../../utils/errors';
import { validateName } from '../../utils/validation';

/** A label and value pair in the account card. */
function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/**
 * Account screen: view and edit the profile, sync offline entries,
 * reset the password, log out and delete the account.
 * Administrators also get links to the benchmark and analytics tools.
 */
export default function ProfileScreen({ navigation }) {
  const { user, displayName, isAdmin } = useAuth();
  const { pendingCount, syncNow } = useTips();
  const showToast = useToast();

  // Null until the user types, so the field always starts from the saved name.
  const [nameDraft, setNameDraft] = useState(null);
  const name = nameDraft ?? displayName;
  const [nameError, setNameError] = useState(null);
  const [busy, setBusy] = useState(null); // which action is running: 'name' | 'sync' | 'reset' | 'logout' | 'delete'
  const [dialog, setDialog] = useState(null); // which dialog is open: 'logout' | 'delete'
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const closeDialog = () => {
    setDialog(null);
    setPassword('');
    setPasswordError(null);
  };

  const handleSaveName = async () => {
    const error = validateName(name);
    setNameError(error);
    if (error) return;

    setBusy('name');
    try {
      await updateUserName(user.uid, name);
      setNameDraft(null);
      showToast('Name updated.');
    } catch (saveError) {
      showToast(getDataErrorMessage(saveError), 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleSync = async () => {
    setBusy('sync');
    const uploaded = await syncNow();
    setBusy(null);
    if (uploaded) showToast(`${uploaded} ${uploaded === 1 ? 'entry' : 'entries'} synced.`);
    else showToast('Could not sync yet. Check your signal and try again.', 'error');
  };

  const handlePasswordReset = async () => {
    setBusy('reset');
    try {
      await requestPasswordReset(user.email);
      showToast(`Reset link sent to ${user.email}.`);
    } catch (error) {
      showToast(getAuthErrorMessage(error), 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleLogout = async () => {
    setBusy('logout');
    try {
      await logout();
      showToast('You have been logged out.', 'info');
    } catch (error) {
      showToast(getAuthErrorMessage(error), 'error');
      setBusy(null);
      closeDialog();
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setPasswordError('Enter your password to confirm.');
      return;
    }
    setBusy('delete');
    try {
      await deleteAccount(password);
      showToast('Your account and tip records have been deleted.', 'info');
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error));
      setBusy(null);
    }
  };

  return (
    <ScreenLayout title="Profile">
      <Card style={styles.card}>
        <Detail label="Email" value={user.email} />
        <Detail label="Restaurant" value={DEFAULT_RESTAURANT.name} />
        <Detail label="Role" value={isAdmin ? 'Administrator' : 'Server'} />
      </Card>

      <AppInput
        label="Full name"
        autoCapitalize="words"
        value={name}
        onChangeText={(value) => {
          setNameDraft(value);
          setNameError(null);
        }}
        error={nameError}
      />
      <AppButton
        title="Save name"
        variant="outline"
        onPress={handleSaveName}
        loading={busy === 'name'}
        disabled={name.trim() === displayName}
        style={styles.action}
      />

      {pendingCount ? (
        <>
          <SectionLabel>Offline entries</SectionLabel>
          <Text style={styles.text}>
            {pendingCount} {pendingCount === 1 ? 'entry is' : 'entries are'} saved on this phone and waiting to sync.
          </Text>
          <AppButton
            title="Sync now"
            variant="outline"
            onPress={handleSync}
            loading={busy === 'sync'}
            style={styles.action}
          />
        </>
      ) : null}

      {isAdmin ? (
        <>
          <SectionLabel>Administrator tools</SectionLabel>
          <AppButton
            title="Manage benchmarks"
            variant="outline"
            onPress={() => navigation.navigate('AdminBenchmarks')}
            style={styles.linkedAction}
          />
          <AppButton
            title="View A/B analytics"
            variant="outline"
            onPress={() => navigation.navigate('AdminAnalytics')}
            style={styles.action}
          />
        </>
      ) : null}

      <SectionLabel>Account</SectionLabel>
      <AppButton
        title="Email me a password reset link"
        variant="outline"
        onPress={handlePasswordReset}
        loading={busy === 'reset'}
        style={styles.linkedAction}
      />
      <AppButton title="Log out" onPress={() => setDialog('logout')} style={styles.linkedAction} />
      <AppButton title="Delete my account" variant="text" onPress={() => setDialog('delete')} />

      <ConfirmDialog
        visible={dialog === 'logout'}
        title="Log out?"
        message={
          pendingCount
            ? 'Entries waiting to sync stay on this phone and will upload when you sign in again.'
            : 'You will need your email and password to sign in again.'
        }
        confirmLabel="Log out"
        loading={busy === 'logout'}
        onConfirm={handleLogout}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        visible={dialog === 'delete'}
        title="Delete your account?"
        message="Your profile and every tip entry will be removed for good. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={busy === 'delete'}
        onConfirm={handleDeleteAccount}
        onCancel={closeDialog}
      >
        <AppInput
          label="Password"
          placeholder="Enter your password to confirm"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(null);
          }}
          error={passwordError}
        />
      </ConfirmDialog>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.xl },
  detail: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  detailLabel: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  detailValue: { flex: 1, textAlign: 'right', color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.sm },
  text: { color: colors.text, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.md },
  action: { marginBottom: spacing.xl },
  linkedAction: { marginBottom: spacing.md },
});
