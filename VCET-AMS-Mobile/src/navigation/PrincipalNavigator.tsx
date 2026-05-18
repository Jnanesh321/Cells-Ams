import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrincipalDashboardScreen from '../screens/principal/DashboardScreen';
import PrincipalAnalyticsScreen from '../screens/principal/AnalyticsScreen';
import PrincipalNoticesScreen from '../screens/principal/NoticesScreen';
import DeptDetailScreen from '../screens/principal/DeptDetailScreen';
import { useAuthStore } from '../store/auth';
import Button from '../components/Button';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  return (
    <View className="flex-1 bg-slate-900 p-4 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">{user?.name}</Text>
      <Text className="text-slate-400 mb-2">{user?.email}</Text>
      <Text className="text-slate-400 mb-8 text-sm">Principal • VCET Puttur</Text>
      <Button title="Logout" onPress={logout} className="bg-red-600 w-full" />
    </View>
  );
};

const PrincipalNavigator = () => {
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
              tabBarActiveTintColor: '#6366F1',
              tabBarInactiveTintColor: '#475569',
              tabBarStyle: {
                backgroundColor: '#0F172A',
                borderTopColor: '#1E293B',
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
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen name="DeptDetailScreen" component={DeptDetailScreen} />
    </Stack.Navigator>
  );
};

export default PrincipalNavigator;
