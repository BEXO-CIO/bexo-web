import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '../../components/OnboardingShell';
import { theme } from '../../lib/theme';

export default function Step2GoogleAuth() {
  const router = useRouter();

  return (
    <OnboardingShell currentStep={2}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 2 of 9</Text>
        <Text style={styles.title}>Link Google Account</Text>
        <Text style={styles.description}>
          Import your profile, achievements, and contacts from Google.
        </Text>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => router.push('/step/3')}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push('/step/3')}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    gap: 12,
    marginTop: 20,
  },
  googleButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.sansBold,
  },
  skipButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  skipButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.fonts.sansMedium,
  },
});
