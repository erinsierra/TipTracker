import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { isFirebaseConfigured } from './src/config/firebase';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import RootNavigator from './src/navigation/RootNavigator';
import SetupScreen from './src/screens/SetupScreen';

// App entry point
// Loads fonts, then wraps screens in shared providers (safe area, toasts, login, navigation)
export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  // Waits for fonts so text doesn't jump, falls back to system font if they fail
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        {isFirebaseConfigured ? (
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        ) : (
          <SetupScreen />
        )}
      </ToastProvider>
    </SafeAreaProvider>
  );
}
