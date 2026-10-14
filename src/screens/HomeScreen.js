import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '../components/AppButton';
import { DEFAULT_RESTAURANT } from '../config/constants';
import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

/** Explains one of the two modes above its button. */
function ModeCard({ title, description }) {
  return (
    <View style={styles.modeCard}>
      <Text style={styles.modeTitle}>{title}</Text>
      <Text style={styles.modeDescription}>{description}</Text>
    </View>
  );
}

/**
 * First screen of the app: choose Customer mode (guest calculator)
 * or Server mode (sign in to log and track tips).
 */
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.logo}>
          <Ionicons name="cash-outline" size={34} color={colors.white} />
        </View>
        <Text accessibilityRole="header" style={styles.appName}>
          Tip Tracker
        </Text>
        <Text style={styles.tagline}>Fair tips, the South African way</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <ModeCard title="I'm a customer" description="Calculate a fair tip - no account needed" />
        <AppButton
          title="Continue as customer"
          onPress={() => navigation.navigate('Calculator')}
          style={styles.button}
        />

        <ModeCard title="I'm a server" description="Log tips and track your earnings" />
        <AppButton
          title="Continue as server"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: { color: colors.white, fontFamily: fonts.medium, fontSize: fontSizes.xl },
  tagline: { color: colors.white, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  content: { padding: spacing.xl },
  modeCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  modeTitle: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.lg },
  modeDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  button: { marginBottom: spacing.xl },
  pilot: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.xs, textAlign: 'center' },
});
