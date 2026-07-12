import { type ReactNode, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { GlassSurface, ProfileIcon, WalletIcon } from '../components';
import { CopilotScreen, MenuScreen, WalletScreen } from '../screens';
import { colors, radius } from '../theme';

type Overlay = 'wallet' | 'menu' | null;

/**
 * Signed-in app shell. Copilot is the single main screen; the top bar opens the
 * profile/menu (left) and wallet (right) as full-screen sheets. No tab bar.
 */
export function AppShell() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const close = () => setOverlay(null);

  return (
    <View style={styles.root}>
      <CopilotScreen
        headerLeft={
          <HeaderButton onPress={() => setOverlay('menu')} label="Open profile">
            <ProfileIcon />
          </HeaderButton>
        }
        headerRight={
          <HeaderButton onPress={() => setOverlay('wallet')} label="Open wallet">
            <WalletIcon />
          </HeaderButton>
        }
      />

      <Modal visible={overlay === 'wallet'} animationType="slide" onRequestClose={close}>
        <WalletScreen onClose={close} />
      </Modal>
      <Modal visible={overlay === 'menu'} animationType="slide" onRequestClose={close}>
        <MenuScreen onClose={close} />
      </Modal>
    </View>
  );
}

function HeaderButton({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
      <GlassSurface tint="neutral" radiusToken={radius.full} style={styles.button}>
        {children}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
