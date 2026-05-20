import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import AdmissionDashboardScreen from '../screens/admission/DashboardScreen';
import BatchCreateScreen from '../screens/admission/BatchCreateScreen';
import BulkStudentEntryScreen from '../screens/admission/BulkStudentEntryScreen';
import USNMappingScreen from '../screens/admission/USNMappingScreen';
import AdmissionProfileScreen from '../screens/admission/AdmissionProfileScreen';

const Tab = createBottomTabNavigator();

const AdmissionNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Batches: focused ? 'layers' : 'layers-outline',
            Students: focused ? 'people' : 'people-outline',
            Mappings: focused ? 'map' : 'map-outline',
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
        tabBarActiveTintColor: colors.accentAdmission,
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
      <Tab.Screen name="Dashboard" component={AdmissionDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Batches" component={BatchCreateScreen} options={{ tabBarLabel: 'Batches' }} />
      <Tab.Screen name="Students" component={BulkStudentEntryScreen} options={{ tabBarLabel: 'Students' }} />
      <Tab.Screen name="Mappings" component={USNMappingScreen} options={{ tabBarLabel: 'Mappings' }} />
      <Tab.Screen name="Profile" component={AdmissionProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AdmissionNavigator;
