import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import ScreenLayout from '../../components/ScreenLayout';
import SectionLabel from '../../components/SectionLabel';
import { useAuth } from '../../context/AuthContext';
import { useTips } from '../../context/TipsContext';
import { useToast } from '../../context/ToastContext';
import { deleteAccount, getAuthErrorMessage, logout } from '../../services/authService';
import { colors, fontSizes, fonts, spacing } from '../../theme/theme';

// Label and value row in the account card
function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// Shows the signed-in user, offline sync, sign out and account deletion
// Admins also get a link to the A/B analytics
export default function AccountScreen({ navigation }) {
  const { user, displayName, isAdmin } = useAuth();
  const { pendingCount, syncNow } = useTips();
  const showToast = useToast();

  const [dialog, setDialog] = useState(null); // 'logout' or 'delete'
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const closeDialog = () => {
    setDialog(null);
    setPassword('');
    setPasswordError(null);
  };

  const handleSync = async () => {
    setSyncing(true);
    const uploaded = await syncNow();
    setSyncing(false);
    if (uploaded) showToast(`${uploaded} ${uploaded === 1 ? 'tip' : 'tips'} synced.`);
    else showToast('Could not sync yet. Check your signal and try again.', 'error');
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      showToast('You have been signed out.', 'info');
    } catch (error) {
      showToast(getAuthErrorMessage(error), 'error');
      setBusy(false);
      closeDialog();
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setPasswordError('Enter your password to confirm.');
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(password);
      showToast('Your account and tips have been deleted.', 'info');
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error));
      setBusy(false);
    }
  };

  return (
    <ScreenLayout title="Account">
      <Card style={styles.card}>
        <Detail label="Name" value={displayName} />
        <Detail label="Email" value={user.email} />
      </Card>

      {pendingCount ? (
        <>
          <SectionLabel>Offline tips</SectionLabel>
          <Text style={styles.text}>
            {pendingCount} {pendingCount === 1 ? 'tip is' : 'tips are'} saved on this phone and waiting to sync.
          </Text>
          <AppButton title="Sync now" variant="outline" onPress={handleSync} loading={syncing} style={styles.action} />
        </>
      ) : null}

      {isAdmin ? (
        <>
          <SectionLabel>Administrator</SectionLabel>
          <AppButton
            title="View A/B analytics"
            variant="outline"
            onPress={() => navigation.navigate('AdminAnalytics')}
            style={styles.action}
          />
        </>
      ) : null}

      <AppButton title="Sign out" onPress={() => setDialog('logout')} style={styles.signOut} />
      <AppButton title="Delete my account" variant="text" onPress={() => setDialog('delete')} />

      <ConfirmDialog
        visible={dialog === 'logout'}
        title="Sign out?"
        message={
          pendingCount
            ? 'Tips waiting to sync stay on this phone and will upload when you sign in again.'
            : 'You will need your email and password to sign in again.'
        }
        confirmLabel="Sign out"
        loading={busy}
        onConfirm={handleLogout}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        visible={dialog === 'delete'}
        title="Delete your account?"
        message="Your account and every tip you have logged will be removed for good. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={busy}
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
  signOut: { marginBottom: spacing.md },
});
