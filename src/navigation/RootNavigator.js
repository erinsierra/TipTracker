import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingView from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';
import { TipsProvider } from '../context/TipsContext';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminBenchmarksScreen from '../screens/admin/AdminBenchmarksScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import HomeScreen from '../screens/HomeScreen';
import EditTipScreen from '../screens/server/EditTipScreen';
import ServerTabs from './ServerTabs';

const Stack = createNativeStackNavigator();
const SCREEN_OPTIONS = { headerShown: false };

/** Screens anyone can open: role selection, the guest calculator and sign-in. */
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

/** Screens for signed-in servers. Administrator screens are only added for administrators. */
function ServerStack() {
  const { isAdmin } = useAuth();
  return (
    <TipsProvider>
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="Tabs" component={ServerTabs} />
        <Stack.Screen name="EditTip" component={EditTipScreen} />
        {isAdmin ? (
          <>
            <Stack.Screen name="AdminBenchmarks" component={AdminBenchmarksScreen} />
            <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
          </>
        ) : null}
      </Stack.Navigator>
    </TipsProvider>
  );
}

/**
 * Chooses which set of screens exists based on the login state. Because the
 * server screens are not even mounted for guests, they cannot be reached
 * without signing in, and logging out clears the back-stack automatically.
 */
export default function RootNavigator() {
  const { user, initialising } = useAuth();

  if (initialising) return <LoadingView message="Starting Tip Tracker…" />;
  return user ? <ServerStack /> : <PublicStack />;
}
