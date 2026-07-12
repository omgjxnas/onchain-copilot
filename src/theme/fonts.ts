import { useFonts } from 'expo-font';

/**
 * Loads the app's custom typefaces. The family keys here must match the
 * `fonts` primitive names used in the text tokens.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../../assets/fonts/SpaceMono-Bold.ttf'),
  });
  return loaded;
}
