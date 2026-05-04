import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { THEME } from '../constants/colors';

import StashListScreen from '../screens/StashListScreen';
import AddYarnScreen from '../screens/AddYarnScreen';
import YarnDetailScreen from '../screens/YarnDetailScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type StashStackParamList = {
  StashList: undefined;
  AddYarn: undefined;
  YarnDetail: { yarnId: string };
  EditYarn: { yarnId: string };
};

export type RootTabParamList = {
  StashTab: undefined;
  Suggestions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const StashStack = createNativeStackNavigator<StashStackParamList>();

function StashNavigator() {
  return (
    <StashStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: THEME.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <StashStack.Screen
        name="StashList"
        component={StashListScreen}
        options={{ title: 'My Stash' }}
      />
      <StashStack.Screen
        name="AddYarn"
        component={AddYarnScreen}
        options={{ title: 'Add Yarn' }}
      />
      <StashStack.Screen
        name="YarnDetail"
        component={YarnDetailScreen}
        options={{ title: 'Yarn Details' }}
      />
      <StashStack.Screen
        name="EditYarn"
        component={AddYarnScreen}
        options={{ title: 'Edit Yarn' }}
      />
    </StashStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'My Stash': '🧶',
    'Suggestions': '✨',
    'Settings': '⚙️',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '?'}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            label={
              route.name === 'StashTab'
                ? 'My Stash'
                : route.name === 'Suggestions'
                ? 'Suggestions'
                : 'Settings'
            }
            focused={focused}
          />
        ),
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.textSecondary,
        tabBarStyle: { paddingBottom: 4, height: 56 },
      })}
    >
      <Tab.Screen
        name="StashTab"
        component={StashNavigator}
        options={{ title: 'My Stash' }}
      />
      <Tab.Screen
        name="Suggestions"
        component={SuggestionsScreen}
        options={{
          title: 'Suggestions',
          headerShown: true,
          headerStyle: { backgroundColor: THEME.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: { backgroundColor: THEME.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
    </Tab.Navigator>
  );
}
