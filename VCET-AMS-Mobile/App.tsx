import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { rehydrateAuth } from './src/store/authStore';
import Loader from './src/components/Loader';
import OfflineBanner from './src/components/OfflineBanner';
import { queryClient } from './src/services/queryClient';

const REHYDRATION_TIMEOUT = 5000;

export default function App() {
  const [ready, setReady] = useState(false);
  const [rehydrateError, setRehydrateError] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mounted.current && !ready) {
        setReady(true);
        setRehydrateError(true);
      }
    }, REHYDRATION_TIMEOUT);

    void (async () => {
      try {
        await rehydrateAuth();
      } catch {
        if (mounted.current) {
          setRehydrateError(true);
        }
      } finally {
        if (mounted.current) {
          setReady(true);
        }
      }
    })();

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  if (!ready) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView className="flex-1 bg-slate-950">
          <OfflineBanner />
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
