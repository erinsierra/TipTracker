import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingView from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';
import { TipsProvider } from '../context/TipsContext';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import HomeScreen from '../screens/HomeScreen';
import ServerTabs from './ServerTabs';

const Stack = createNativeStackNavigator();
const SCREEN_OPTIONS = { headerShown: false };

/** Screens anyone can open: the start screen, the guest calculator and sign-in. */
function PublicStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

/** Screens for signed-in servers. The analytics screen is only added for administrators. */
function ServerStack() {
  const { isAdmin } = useAuth();
  return (
    <TipsProvider>
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="Tabs" component={ServerTabs} />
        {isAdmin ? <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} /> : null}
      </Stack.Navigator>
    </TipsProvider>
  );
}

/**
 * Chooses which screens exist based on the sign-in state. Server screens are not
 * mounted for guests, so they cannot be reached without signing in, and signing
 * out clears the back-stack automatically.
 */
export default function RootNavigator() {
  const { user, initialising } = useAuth();

  if (initialising) return <LoadingView message="Starting Tip Tracker…" />;
  return user ? <ServerStack /> : <PublicStack />;
}
