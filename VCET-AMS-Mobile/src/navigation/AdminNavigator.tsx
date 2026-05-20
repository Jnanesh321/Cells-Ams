import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import BulkStudentCreateScreen from '../screens/admin/BulkStudentCreateScreen';
import AdminSettingsScreen from '../screens/admin/SettingsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const UsersStack = createStackNavigator();

const UsersStackNavigator = () => (
  <UsersStack.Navigator screenOptions={{ headerShown: false }}>
    <UsersStack.Screen name="UsersList" component={AdminUsersScreen} />
    <UsersStack.Screen name="BulkStudentCreate" component={BulkStudentCreateScreen} />
  </UsersStack.Navigator>
);

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Users: focused ? 'people' : 'people-outline',
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
        tabBarActiveTintColor: colors.accentAdmin,
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
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Users" component={UsersStackNavigator} options={{ tabBarLabel: 'Users' }} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
