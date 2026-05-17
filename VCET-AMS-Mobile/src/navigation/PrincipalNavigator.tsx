import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
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
            screenOptions={{
              headerShown: false,
              tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
              tabBarActiveTintColor: '#f59e0b',
              tabBarInactiveTintColor: '#94a3b8',
            }}
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
