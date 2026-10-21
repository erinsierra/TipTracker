import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSizes, fonts, radius, spacing } from '../theme/theme';

// Large tappable card for each way to use the app
function OptionCard({ icon, title, description, onPress, filled = false }) {
  const foreground = filled ? colors.white : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, filled ? styles.cardFilled : styles.cardOutline, pressed && styles.pressed]}
    >
      <View style={[styles.cardIcon, filled ? styles.cardIconFilled : styles.cardIconOutline]}>
        <Ionicons name={icon} size={26} color={foreground} />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, filled && styles.onFilled]}>{title}</Text>
        <Text style={[styles.cardDescription, filled && styles.onFilled]}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={foreground} />
    </Pressable>
  );
}

// First screen: customer calculator or server sign-in
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
        <View style={styles.logo}>
          <Ionicons name="cash-outline" size={36} color={colors.white} />
        </View>
        <Text accessibilityRole="header" style={styles.appName}>
          Tip Tracker
        </Text>
        <Text style={styles.tagline}>Fair tips, the South African way</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <OptionCard
          filled
          icon="calculator-outline"
          title="I'm a customer"
          description="Work out a fair tip. No account needed."
          onPress={() => navigation.navigate('Calculator')}
        />
        <OptionCard
          icon="restaurant-outline"
          title="I'm a server"
          description="Sign in to log and track your tips."
          onPress={() => navigation.navigate('Login')}
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
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: { color: colors.white, fontFamily: fonts.semiBold, fontSize: fontSizes.xl },
  tagline: { color: colors.white, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  content: { padding: spacing.xl, gap: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardFilled: { backgroundColor: colors.primary },
  cardOutline: { backgroundColor: colors.cream, borderColor: colors.creamBorder },
  pressed: { opacity: 0.85 },
  cardIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardIconFilled: { backgroundColor: colors.primaryDark },
  cardIconOutline: { backgroundColor: colors.white },
  cardText: { flex: 1 },
  cardTitle: { color: colors.text, fontFamily: fonts.semiBold, fontSize: fontSizes.lg },
  cardDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: fontSizes.sm },
  onFilled: { color: colors.white },
});
