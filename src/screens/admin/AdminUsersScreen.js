import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import ScreenLayout from '../../components/ScreenLayout';
import { ROLES } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchAllUsers, updateUserRole } from '../../services/userService';
import { colors, fontSizes, fonts, radius, spacing } from '../../theme/theme';
import { formatLongDate, toDateKey } from '../../utils/dates';
import { getDataErrorMessage } from '../../utils/errors';

// One user in the list
// onChangeRole (optional): shows a button to switch their role
function UserRow({ user, isSelf, onChangeRole }) {
  const isAdmin = user.role === ROLES.admin;
  const joined = user.createdAt ? formatLongDate(toDateKey(new Date(user.createdAt))) : '-';

  return (
    <View style={styles.row}>
      <View
        accessible
        accessibilityLabel={`${user.name}${isSelf ? ' (you)' : ''}, ${user.email}, ${isAdmin ? 'admin' : 'server'}, joined ${joined}`}
        style={styles.details}
      >
        <Text style={styles.name}>
          {user.name}
          {isSelf ? <Text style={styles.you}> (you)</Text> : null}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.joined}>Joined {joined}</Text>
      </View>
      <View style={styles.side}>
        <View style={[styles.badge, isAdmin && styles.badgeAdmin]}>
          <Text style={[styles.badgeText, isAdmin && styles.badgeTextAdmin]}>{isAdmin ? 'Admin' : 'Server'}</Text>
        </View>
        {onChangeRole ? (
          <AppButton title={isAdmin ? 'Make server' : 'Make admin'} variant="text" onPress={onChangeRole} />
        ) : null}
      </View>
    </View>
  );
}

// Admin screen listing all registered users
// Admins can change other users' roles
export default function AdminUsersScreen({ navigation }) {
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [userToChange, setUserToChange] = useState(null);
  const [changing, setChanging] = useState(false);

  // Loads users on open and each time Refresh is pressed
  useEffect(() => {
    let active = true;
    fetchAllUsers()
      .then((list) => {
        if (active) setUsers(list);
      })
      .catch((error) => {
        if (active) showToast(getDataErrorMessage(error), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshCount, showToast]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshCount((count) => count + 1);
  };

  // Switches the selected user between server and admin
  const handleRoleChange = async () => {
    const newRole = userToChange.role === ROLES.admin ? ROLES.server : ROLES.admin;
    setChanging(true);
    try {
      await updateUserRole(userToChange.id, newRole);
      setUsers((current) => current.map((item) => (item.id === userToChange.id ? { ...item, role: newRole } : item)));
      showToast(`${userToChange.name} is now ${newRole === ROLES.admin ? 'an admin' : 'a server'}.`);
    } catch (error) {
      showToast(getDataErrorMessage(error), 'error');
    } finally {
      setChanging(false);
      setUserToChange(null);
    }
  };

  if (loading && !users.length) return <LoadingView message="Loading users…" />;

  const adminCount = users.filter((item) => item.role === ROLES.admin).length;
  const promoting = userToChange?.role !== ROLES.admin;

  return (
    <ScreenLayout title="Registered users" onBack={navigation.goBack} scroll={false}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Card style={styles.summary}>
            <Text style={styles.summaryText}>
              {users.length} {users.length === 1 ? 'user' : 'users'} · {adminCount}{' '}
              {adminCount === 1 ? 'admin' : 'admins'}
            </Text>
          </Card>
        }
        renderItem={({ item }) => {
          const isSelf = item.id === currentUser.uid;
          return <UserRow user={item} isSelf={isSelf} onChangeRole={isSelf ? undefined : () => setUserToChange(item)} />;
        }}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No users found" />}
        ListFooterComponent={
          <AppButton title="Refresh" variant="outline" onPress={handleRefresh} loading={loading} style={styles.refresh} />
        }
      />

      <ConfirmDialog
        visible={Boolean(userToChange)}
        title={promoting ? 'Make this user an admin?' : 'Remove admin access?'}
        message={
          userToChange
            ? promoting
              ? `${userToChange.name} will be able to see the A/B analytics and the list of users.`
              : `${userToChange.name} will go back to being a server and lose access to admin screens.`
            : ''
        }
        confirmLabel={promoting ? 'Make admin' : 'Make server'}
        destructive={!promoting}
        loading={changing}
        onConfirm={handleRoleChange}
        onCancel={() => setUserToChange(null)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl },
  summary: { marginBottom: spacing.md },
  summaryText: { color: colors.primaryDark, fontFamily: fonts.medium, fontSize: fontSizes.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamBorder,
  },
  details: { flex: 1, paddingRight: spacing.sm },
  name: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.md },
  you: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  email: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  joined: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.xs },
  side: { alignItems: 'flex-end' },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeAdmin: { backgroundColor: colors.primary },
  badgeText: { color: colors.primary, fontFamily: fonts.medium, fontSize: fontSizes.xs },
  badgeTextAdmin: { color: colors.white },
  refresh: { marginTop: spacing.xl },
});
