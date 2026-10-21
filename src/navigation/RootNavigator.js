import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingView from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';
import { TipsProvider } from '../context/TipsContext';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import HomeScreen from '../screens/HomeScreen';
import EditTipScreen from '../screens/server/EditTipScreen';
import ServerTabs from './ServerTabs';

const Stack = createNativeStackNavigator();
const SCREEN_OPTIONS = { headerShown: false };

// Public screens: home, guest calculator and sign-in
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

// Screens for signed-in servers, analytics is admin only
function ServerStack() {
  const { isAdmin } = useAuth();
  return (
    <TipsProvider>
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="Tabs" component={ServerTabs} />
        <Stack.Screen name="EditTip" component={EditTipScreen} />
        {isAdmin ? <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} /> : null}
        {isAdmin ? <Stack.Screen name="AdminUsers" component={AdminUsersScreen} /> : null}
      </Stack.Navigator>
    </TipsProvider>
  );
}

// Picks screens based on sign-in state
// Guests can't reach server screens, and signing out clears the back history
export default function RootNavigator() {
  const { user, initialising } = useAuth();

  if (initialising) return <LoadingView message="Starting Tip Tracker…" />;
  return user ? <ServerStack /> : <PublicStack />;
}
