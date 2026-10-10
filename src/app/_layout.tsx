import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreen } from '../../App';
import { ProgressProvider, useProgressStore } from '../storage/ProgressContext';

function AppRoutes() {
  const { isLoaded } = useProgressStore();
  if (!isLoaded) return <LoadingScreen />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <AppRoutes />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
