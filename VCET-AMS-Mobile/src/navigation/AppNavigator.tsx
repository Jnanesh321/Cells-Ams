import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/auth';
import { navigationRef } from './navigationRef';
import LoginScreen from '../screens/LoginScreen';
import DemoCredentialsScreen from '../screens/DemoCredentialsScreen';
import StudentNavigator from './StudentNavigator';
import FacultyNavigator from './FacultyNavigator';
import HodNavigator from './HodNavigator';
import PrincipalNavigator from './PrincipalNavigator';
import AdminNavigator from './AdminNavigator';
import ParentNavigator from './ParentNavigator';
import AdmissionNavigator from './AdmissionNavigator';
import ExamCellNavigator from './ExamCellNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);

  console.log('[NAV] RENDER isAuthenticated:', isAuthenticated, '| role:', userRole);

  useEffect(() => {
    console.log('[NAV] useEffect fired, isAuthenticated:', isAuthenticated, 'role:', userRole);

    if (!isAuthenticated) {
      let attempts = 0;
      const tryReset = () => {
        attempts++;
        console.log(`[NAV] logout isReady attempt ${attempts}:`, navigationRef.isReady());
        if (navigationRef.isReady()) {
          try {
            navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
            console.log('[NAV] *** logged out — reset to Login');
          } catch (e) {
            console.log('[NAV] logout reset error:', e);
          }
        } else if (attempts < 30) {
          setTimeout(tryReset, 100);
        } else {
          console.log('[NAV] logout gave up after 30 attempts');
        }
      };
      setTimeout(tryReset, 50);
      return;
    }

    if (!userRole) return;

    const routeMap: Record<string, string> = {
      ADMIN: 'Admin',
      STUDENT: 'Student',
      FACULTY: 'Faculty',
      HOD: 'HOD',
      PRINCIPAL: 'Principal',
      PARENT: 'Parent',
      ADMISSION_CELL: 'Admission',
      EXAM_CELL: 'ExamCell',
    };

    const targetRoute = routeMap[userRole];
    if (!targetRoute) return;

    let attempts = 0;
    const tryReset = () => {
      attempts++;
      console.log(`[NAV] isReady attempt ${attempts}:`, navigationRef.isReady());
      if (navigationRef.isReady()) {
        try {
          navigationRef.reset({ index: 0, routes: [{ name: targetRoute }] });
          console.log('[NAV] *** reset fired to:', targetRoute);
        } catch (e) {
          console.log('[NAV] reset error:', e);
        }
      } else if (attempts < 30) {
        setTimeout(tryReset, 100);
      } else {
        console.log('[NAV] gave up after 30 attempts');
      }
    };
    setTimeout(tryReset, 50);
  }, [isAuthenticated, userRole]);

  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DemoCredentials" component={DemoCredentialsScreen} />
      <Stack.Screen name="Student" component={StudentNavigator} />
      <Stack.Screen name="Faculty" component={FacultyNavigator} />
      <Stack.Screen name="HOD" component={HodNavigator} />
      <Stack.Screen name="Principal" component={PrincipalNavigator} />
      <Stack.Screen name="Admin" component={AdminNavigator} />
      <Stack.Screen name="Parent" component={ParentNavigator} />
      <Stack.Screen name="Admission" component={AdmissionNavigator} />
      <Stack.Screen name="ExamCell" component={ExamCellNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
