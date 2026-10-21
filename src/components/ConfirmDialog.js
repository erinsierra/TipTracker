import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';
import AppButton from './AppButton';

// Asks the user to confirm actions that can't be undone
// (deleting an entry, logging out, deleting the account)
// Extra content like a password field can be passed as children
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View accessibilityRole="alert" style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          <View style={styles.actions}>
            <AppButton title="Cancel" variant="outline" onPress={onCancel} disabled={loading} style={styles.action} />
            <AppButton
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.overlay },
  dialog: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl },
  title: { color: colors.text, fontFamily: fonts.semiBold, fontSize: fontSizes.lg, marginBottom: spacing.sm },
  message: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
});
