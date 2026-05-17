import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/auth';
import LoginScreen from '../screens/LoginScreen';
import DemoCredentialsScreen from '../screens/DemoCredentialsScreen';
import StudentNavigator from './StudentNavigator';
import FacultyNavigator from './FacultyNavigator';
import HodNavigator from './HodNavigator';
import PrincipalNavigator from './PrincipalNavigator';
import AdminNavigator from './AdminNavigator';
import ParentNavigator from './ParentNavigator';
import AdmissionNavigator from './AdmissionNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="DemoCredentials" component={DemoCredentialsScreen} />
          </>
      ) : user?.role === 'STUDENT' ? (
          <Stack.Screen name="Student" component={StudentNavigator} />
      ) : user?.role === 'FACULTY' ? (
          <Stack.Screen name="Faculty" component={FacultyNavigator} />
      ) : user?.role === 'HOD' ? (
        <Stack.Screen name="HOD" component={HodNavigator} />
      ) : user?.role === 'PRINCIPAL' ? (
        <Stack.Screen name="Principal" component={PrincipalNavigator} />
      ) : user?.role === 'ADMIN' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : user?.role === 'PARENT' ? (
        <Stack.Screen name="Parent" component={ParentNavigator} />
      ) : user?.role === 'ADMISSION_CELL' ? (
        <Stack.Screen name="Admission" component={AdmissionNavigator} />
        ) : (
          // Fallback to login if role is not defined
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
