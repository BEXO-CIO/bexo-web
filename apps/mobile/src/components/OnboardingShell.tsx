import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';

interface OnboardingShellProps {
  currentStep: number;
  children: React.ReactNode;
}

export function OnboardingShell({ currentStep, children }: OnboardingShellProps) {
  const steps = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand header */}
          <View style={styles.header}>
            <Text style={styles.brandText}>BEXO</Text>
            
            {/* Step indicator dots */}
            <View style={styles.dotsContainer}>
              {steps.map(step => {
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;
                return (
                  <View
                    key={step}
                    style={[
                      styles.dot,
                      isActive && styles.dotActive,
                      isCompleted && styles.dotCompleted,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Main content container */}
          <View style={styles.container}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 208, 188, 0.4)',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 1.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 12,
    backgroundColor: theme.colors.primary,
  },
  dotCompleted: {
    backgroundColor: theme.colors.primary,
    opacity: 0.5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
});
