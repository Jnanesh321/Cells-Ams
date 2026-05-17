import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { rehydrateAuth } from './src/store/authStore';
import Loader from './src/components/Loader';
import OfflineBanner from './src/components/OfflineBanner';
import { queryClient } from './src/services/queryClient';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      await rehydrateAuth();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 bg-slate-900">
        <Loader />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 bg-slate-950">
        <OfflineBanner />
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </View>
    </QueryClientProvider>
  );
}
