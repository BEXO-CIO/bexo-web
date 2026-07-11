import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '../../components/OnboardingShell';
import { theme } from '../../lib/theme';

export default function Step4ResumeUpload() {
  const router = useRouter();

  return (
    <OnboardingShell currentStep={4}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 4 of 9</Text>
        <Text style={styles.title}>Upload Resume</Text>
        <Text style={styles.description}>
          Upload your PDF resume. We will parse it to auto-populate your sections.
        </Text>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/step/5')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
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
