import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from './src/navigation/AppShell';
import { OnboardingFlow } from './src/onboarding';
import { colors, useAppFonts } from './src/theme';
import { WalletProvider } from './src/wallet';

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    // Hold on a dark screen until the mono font is ready (avoids a flash of
    // fallback type).
    return <View style={styles.root} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <WalletProvider>
          <StatusBar style="light" />
          {onboarded ? <AppShell /> : <OnboardingFlow onFinish={() => setOnboarded(true)} />}
        </WalletProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
