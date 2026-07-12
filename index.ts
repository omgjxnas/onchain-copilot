// Must be first: installs a real CSPRNG (crypto.getRandomValues) before any
// viem key generation runs.
import 'react-native-get-random-values';
// Then gesture-handler installs its native handlers.
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
