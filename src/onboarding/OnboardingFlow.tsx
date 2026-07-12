import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassButton, NeuralGrid, ProgressBar } from '../components';
import { colors, space, text } from '../theme';
import { GOAL_OPTIONS, LEVELS } from './data';
import { ChoiceStep } from './steps/ChoiceStep';
import { DoneStep } from './steps/DoneStep';
import { MultiSelectStep } from './steps/MultiSelectStep';
import { PromiseStep } from './steps/PromiseStep';
import { RateStep } from './steps/RateStep';
import { WelcomeStep } from './steps/WelcomeStep';

const TOTAL = 6;

type Primary = { label: string; onPress: () => void; enabled: boolean } | null;

type OnboardingFlowProps = {
  /** Called when the user finishes onboarding and enters the app. */
  onFinish?: () => void;
};

/**
 * Interactive onboarding questionnaire / demo. One local state machine drives a
 * sequence of gesture-based steps: tap, drag, multi-select, and swipe.
 */
export function OnboardingFlow({ onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string>();
  const [level, setLevel] = useState(1);
  const [help, setHelp] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const goalLabel = GOAL_OPTIONS.find((o) => o.id === goal)?.label;

  let content: ReactNode;
  let primary: Primary;

  switch (step) {
    case 0:
      content = <WelcomeStep />;
      primary = { label: 'Get started', onPress: next, enabled: true };
      break;
    case 1:
      content = <ChoiceStep value={goal} onChange={setGoal} />;
      primary = { label: 'Continue', onPress: next, enabled: !!goal };
      break;
    case 2:
      content = <RateStep value={level} onChange={setLevel} />;
      primary = { label: 'Continue', onPress: next, enabled: true };
      break;
    case 3:
      content = <MultiSelectStep value={help} onChange={setHelp} />;
      primary = { label: 'Continue', onPress: next, enabled: help.length > 0 };
      break;
    case 4:
      content = <PromiseStep onDone={next} />;
      primary = null;
      break;
    default:
      content = <DoneStep goalLabel={goalLabel} levelLabel={LEVELS[level]} helpCount={help.length} />;
      primary = { label: 'Enter app', onPress: () => onFinish?.(), enabled: true };
  }

  const showBack = step > 0 && step < TOTAL - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {step === 0 ? <NeuralGrid /> : null}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {showBack ? (
            <Pressable onPress={back} hitSlop={12}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>
        <ProgressBar count={TOTAL} index={step} />
      </View>

      <Animated.View key={step} entering={FadeIn.duration(260)} style={styles.body}>
        {content}
      </Animated.View>

      {primary ? (
        <View style={styles.footer}>
          <GlassButton
            variant="primary"
            label={primary.label}
            onPress={primary.onPress}
            disabled={!primary.enabled}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: space[70],
    paddingTop: space[40],
    gap: space[50],
  },
  headerTop: {
    minHeight: 24,
    justifyContent: 'center',
  },
  back: {
    ...text.body,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    paddingHorizontal: space[70],
    paddingTop: space[70],
  },
  footer: {
    paddingHorizontal: space[70],
    paddingTop: space[50],
    paddingBottom: space[50],
  },
});
