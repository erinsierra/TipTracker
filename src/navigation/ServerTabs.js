import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AccountScreen from '../screens/server/AccountScreen';
import HistoryScreen from '../screens/server/HistoryScreen';
import LogTipScreen from '../screens/server/LogTipScreen';
import { colors, fontSizes, fonts, spacing } from '../theme/theme';

const Tab = createBottomTabNavigator();

/** Height of the bar above the phone's own gesture area. Tall enough for an icon and a label. */
const TAB_BAR_HEIGHT = 64;

const TAB_ICONS = {
  LogTip: 'add-circle',
  History: 'time',
  Account: 'person',
};

/** The three signed-in screens, reachable from the bar at the bottom. */
export default function ServerTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: TAB_BAR_HEIGHT + insets.bottom, paddingTop: spacing.xs },
        tabBarLabelStyle: { fontFamily: fonts.regular, fontSize: fontSizes.xs, lineHeight: 18 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="LogTip" component={LogTipScreen} options={{ title: 'Log tip' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
