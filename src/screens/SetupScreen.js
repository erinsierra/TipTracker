import { StyleSheet, Text } from 'react-native';

import ScreenLayout from '../components/ScreenLayout';
import { colors, fontSizes, fonts, spacing } from '../theme/theme';

/** Shown instead of the app when the Firebase keys have not been added yet. */
export default function SetupScreen() {
  return (
    <ScreenLayout title="Set-up needed">
      <Text style={styles.text}>Tip Tracker cannot find its Firebase keys.</Text>
      <Text style={styles.text}>
        Copy .env.example to .env, paste in the values from your Firebase project, then restart the app with: npx expo
        start -c
      </Text>
      <Text style={styles.text}>The README has the full steps.</Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text, fontFamily: fonts.regular, fontSize: fontSizes.md, marginBottom: spacing.lg },
});
