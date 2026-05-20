import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import PrincipalDashboardScreen from '../screens/principal/DashboardScreen';
import PrincipalAnalyticsScreen from '../screens/principal/AnalyticsScreen';
import PrincipalNoticesScreen from '../screens/principal/NoticesScreen';
import DeptDetailScreen from '../screens/principal/DeptDetailScreen';
import PrincipalProfileScreen from '../screens/principal/PrincipalProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PrincipalNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PrincipalTabs">
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                  Dashboard: focused ? 'grid' : 'grid-outline',
                  Analytics: focused ? 'analytics' : 'analytics-outline',
                  Notices: focused ? 'notifications' : 'notifications-outline',
                  Profile: focused ? 'person' : 'person-outline',
                };
                return (
                  <Ionicons
                    name={icons[route.name] ?? 'ellipse-outline'}
                    size={size}
                    color={color}
                  />
                );
              },
            tabBarActiveTintColor: colors.accentPrincipal,
            tabBarInactiveTintColor: colors.tabBarInactive,
              tabBarStyle: {
                backgroundColor: colors.tabBar,
                borderTopColor: colors.tabBarBorder,
                borderTopWidth: 1,
                paddingBottom: 4,
                height: 60,
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Dashboard" component={PrincipalDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
            <Tab.Screen name="Analytics" component={PrincipalAnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
            <Tab.Screen name="Notices" component={PrincipalNoticesScreen} options={{ tabBarLabel: 'Notices' }} />
            <Tab.Screen name="Profile" component={PrincipalProfileScreen} options={{ tabBarLabel: 'Profile' }} />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen name="DeptDetailScreen" component={DeptDetailScreen} />
    </Stack.Navigator>
  );
};

export default PrincipalNavigator;
