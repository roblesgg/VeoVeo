import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerRootComponent } from 'expo';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
