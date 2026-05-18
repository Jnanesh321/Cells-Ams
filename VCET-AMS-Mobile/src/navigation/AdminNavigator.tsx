import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import BulkStudentCreateScreen from '../screens/admin/BulkStudentCreateScreen';
import AdminSettingsScreen from '../screens/admin/SettingsScreen';
import { useAuthStore } from '../store/auth';
import Button from '../components/Button';

const UsersStack = createStackNavigator();

const UsersStackNavigator = () => (
  <UsersStack.Navigator screenOptions={{ headerShown: false }}>
    <UsersStack.Screen name="UsersList" component={AdminUsersScreen} />
    <UsersStack.Screen name="BulkStudentCreate" component={BulkStudentCreateScreen} />
  </UsersStack.Navigator>
);

const Tab = createBottomTabNavigator();

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  return (
    <View className="flex-1 bg-slate-900 p-4 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">{user?.name}</Text>
      <Text className="text-slate-400 mb-2">{user?.email}</Text>
      <Text className="text-slate-400 mb-8 text-sm">System Administrator</Text>
      <Button title="Logout" onPress={logout} className="bg-red-600 w-full" />
    </View>
  );
};

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Users: focused ? 'person-add' : 'person-add-outline',
            Settings: focused ? 'settings' : 'settings-outline',
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
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Users" component={UsersStackNavigator} options={{ tabBarLabel: 'Users' }} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
