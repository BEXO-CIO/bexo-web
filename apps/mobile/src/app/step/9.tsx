import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '../../components/OnboardingShell';
import { theme } from '../../lib/theme';
import { setAccessToken } from '../../lib/api';

export default function Step9Publish() {
  const router = useRouter();

  const handleFinish = async () => {
    // Clear token to restart the onboarding demo flow
    await setAccessToken(undefined);
    router.replace('/step/1');
  };

  return (
    <OnboardingShell currentStep={9}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 9 of 9</Text>
        <Text style={styles.title}>Publish Portfolio</Text>
        <Text style={styles.description}>
          Choose your public handle and make your portfolio live to the world!
        </Text>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleFinish}
          >
            <Text style={styles.primaryButtonText}>Finish & Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
    fontFamily: theme.fonts.sansBold,
  },
  title: {
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.serif,
  },
  description: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 32,
    fontFamily: theme.fonts.sans,
    lineHeight: 20,
  },
  content: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.sansBold,
  },
});
