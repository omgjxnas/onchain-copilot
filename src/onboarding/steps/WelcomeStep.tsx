import { StyleSheet, Text, View } from 'react-native';

import { space, text } from '../../theme';

/** Opening screen of the onboarding demo. */
export function WelcomeStep() {
  return (
    <View style={styles.center}>
      <Text style={text.label}>PRE-ALPHA</Text>
      <Text style={styles.title}>
        onchain{'\n'}copilot
      </Text>
      <Text style={styles.body}>
        Manage onchain finance on Robinhood Chain through natural language. First, a few taps to
        tune it to you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: space[50],
  },
  title: {
    ...text.display,
    marginTop: space[40],
  },
  body: {
    ...text.body,
    maxWidth: 320,
    marginTop: space[30],
  },
});
