import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import QuestionPaperBuilderScreen from '../screens/examcell/QuestionPaperBuilderScreen';
import AbsenteeScreen from '../screens/examcell/AbsenteeScreen';
import ExamCellProfileScreen from '../screens/examcell/ExamCellProfileScreen';

const PapersStack = createStackNavigator();
const AbsenteesStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PapersStackNavigator = () => (
  <PapersStack.Navigator screenOptions={{ headerShown: false }}>
    <PapersStack.Screen name="PapersList" component={QuestionPaperBuilderScreen} />
  </PapersStack.Navigator>
);

const AbsenteesStackNavigator = () => (
  <AbsenteesStack.Navigator screenOptions={{ headerShown: false }}>
    <AbsenteesStack.Screen name="AbsenteesList" component={AbsenteeScreen} />
  </AbsenteesStack.Navigator>
);

const ExamCellNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Papers: focused ? 'document-text' : 'document-text-outline',
            Absentees: focused ? 'person-remove' : 'person-remove-outline',
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
        tabBarActiveTintColor: colors.accentFaculty,
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
      <Tab.Screen
        name="Papers"
        component={PapersStackNavigator}
        options={{ tabBarLabel: 'Papers' }}
      />
      <Tab.Screen
        name="Absentees"
        component={AbsenteesStackNavigator}
        options={{ tabBarLabel: 'Absentees' }}
      />
      <Tab.Screen
        name="Profile"
        component={ExamCellProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default ExamCellNavigator;
