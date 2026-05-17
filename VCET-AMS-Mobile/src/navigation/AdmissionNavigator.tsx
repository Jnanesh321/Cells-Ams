import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import AdmissionDashboardScreen from '../screens/admission/DashboardScreen';
import BatchCreateScreen from '../screens/admission/BatchCreateScreen';
import BulkStudentEntryScreen from '../screens/admission/BulkStudentEntryScreen';
import USNMappingScreen from '../screens/admission/USNMappingScreen';
import { useAuthStore } from '../store/auth';
import Button from '../components/Button';

const Tab = createBottomTabNavigator();

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  return (
    <View className="flex-1 bg-slate-900 p-4 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">{user?.name}</Text>
      <Text className="text-slate-400 mb-2">{user?.email}</Text>
      <Text className="text-slate-400 mb-8 text-sm">Admission Cell • VCET Puttur</Text>
      <Button title="Logout" onPress={logout} className="bg-red-600 w-full" />
    </View>
  );
};

const AdmissionNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen name="Dashboard" component={AdmissionDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Batches" component={BatchCreateScreen} options={{ tabBarLabel: 'Batches' }} />
      <Tab.Screen name="Students" component={BulkStudentEntryScreen} options={{ tabBarLabel: 'Students' }} />
      <Tab.Screen name="Mappings" component={USNMappingScreen} options={{ tabBarLabel: 'Mappings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdmissionNavigator;
