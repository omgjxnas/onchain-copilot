import { PlaceholderScreen } from './PlaceholderScreen';

export function MenuScreen({ onClose }: { onClose?: () => void }) {
  return (
    <PlaceholderScreen
      eyebrow="PROFILE"
      title="Profile & settings"
      body="Your profile, network, preferences, and account settings will live here."
      glyph="👤"
      onClose={onClose}
    />
  );
}
