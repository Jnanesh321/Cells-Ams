import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import FacultyDashboardScreen from '../screens/FacultyDashboardScreen';
import SubjectPickerScreen from '../screens/SubjectPickerScreen';
import AttendanceSessionScreen from '../screens/AttendanceSessionScreen';
import EditAttendanceScreen from '../screens/EditAttendanceScreen';
import ReviewSubmitScreen from '../screens/ReviewSubmitScreen';
import SuccessConfirmationScreen from '../screens/SuccessConfirmationScreen';
import MarksSubjectPickerScreen from '../screens/faculty/MarksSubjectPickerScreen';
import IAMarksEntryScreen from '../screens/faculty/IAMarksEntryScreen';
import { useAuthStore } from '../store/auth';
import Button from '../components/Button';

const DashboardStack = createStackNavigator();
const MarksStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const SubjectsScreen = () => (
  <View className="flex-1 bg-slate-900 justify-center items-center">
    <Text className="text-white text-lg">Subjects & Sections</Text>
    <Text className="text-slate-400 text-sm mt-2">Coming Soon</Text>
  </View>
);

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  return (
    <View className="flex-1 bg-slate-900 p-4 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">{user?.name}</Text>
      <Text className="text-slate-400 mb-2">{user?.email}</Text>
      <Text className="text-slate-400 mb-8 text-sm">{user?.department} • {user?.designation}</Text>
      <Button title="Logout" onPress={logout} className="bg-red-600 w-full" />
    </View>
  );
};

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={FacultyDashboardScreen} />
    <DashboardStack.Screen name="SubjectPicker" component={SubjectPickerScreen} />
    <DashboardStack.Screen name="AttendanceSession" component={AttendanceSessionScreen} />
    <DashboardStack.Screen name="EditAttendance" component={EditAttendanceScreen} />
    <DashboardStack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />
    <DashboardStack.Screen name="SuccessConfirmation" component={SuccessConfirmationScreen} />
  </DashboardStack.Navigator>
);

const MarksStackNavigator = () => (
  <MarksStack.Navigator screenOptions={{ headerShown: false }}>
    <MarksStack.Screen name="MarksSubjectPicker" component={MarksSubjectPickerScreen} />
    <MarksStack.Screen name="IAMarksEntry" component={IAMarksEntryScreen} />
  </MarksStack.Navigator>
);

const FacultyNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155', paddingVertical: 8 },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{ title: 'Dashboard', tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Subjects"
        component={SubjectsScreen}
        options={{ title: 'Subjects', tabBarLabel: 'Subjects' }}
      />
      <Tab.Screen
        name="Marks"
        component={MarksStackNavigator}
        options={{ title: 'Marks', tabBarLabel: 'Marks' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default FacultyNavigator;
