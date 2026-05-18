import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { Component, ErrorInfo, useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { View, Text } from 'react-native';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { rehydrateAuth } from './src/store/authStore';
import Loader from './src/components/Loader';
import OfflineBanner from './src/components/OfflineBanner';
import { queryClient } from './src/services/queryClient';

class NavErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log('[NAV ERROR BOUNDARY]', error.message);
    console.log('[NAV ERROR BOUNDARY stack]', info.componentStack);
    this.setState({ error: error.message });
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0f172a' }}>
          <Text style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>Nav Error: {this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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
          <NavErrorBoundary>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </NavErrorBoundary>
        </SafeAreaView>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
