import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '../../components/OnboardingShell';
import { client, setAccessToken } from '../../lib/api';
import { theme } from '../../lib/theme';

type Phase = 'phone' | 'otp';

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
];

export default function Step1PhoneOtp() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('phone');
  const [country, setCountry] = useState('+1');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSend = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    const fullPhone = `${country}${phone.replace(/\D/g, '')}`;
    try {
      await client.sendOtp(fullPhone);
      setPhase('otp');
      setCountdown(59);
      setCode('');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    const fullPhone = `${country}${phone.replace(/\D/g, '')}`;
    try {
      const res = await client.verifyOtp(fullPhone, code);
      await setAccessToken(res.accessToken);
      router.replace('/step/2');
    } catch (e: any) {
      setError(e.message || 'Invalid code submitted.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/\D/g, '').slice(0, 6);
    setCode(numericText);
    // If it reaches 6 digits, we can auto-submit or let the user click
    if (numericText.length === 6 && !loading) {
      // Auto verify on 6th digit
      setTimeout(() => {
        // Run verification
        setLoading(true);
        setError('');
        const fullPhone = `${country}${phone.replace(/\D/g, '')}`;
        client.verifyOtp(fullPhone, numericText)
          .then(async (res) => {
            await setAccessToken(res.accessToken);
            router.replace('/step/2');
          })
          .catch((e: any) => {
            setError(e.message || 'Invalid code submitted.');
          })
          .finally(() => {
            setLoading(false);
          });
      }, 100);
    }
  };

  const currentCountry = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];

  return (
    <OnboardingShell currentStep={1}>
      <View>
        <Text style={styles.stepIndicator}>Step 1 of 9</Text>
        <Text style={styles.title}>
          {phase === 'phone' ? 'Verify your phone' : 'Enter the code'}
        </Text>
        <Text style={styles.description}>
          {phase === 'phone'
            ? "We'll send a one-time code to confirm your number."
            : `We texted a 6-digit code to ${country} ${phone}`}
        </Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {phase === 'phone' ? (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Mobile number</Text>
            <View style={styles.phoneInputRow}>
              {/* Country selector button */}
              <TouchableOpacity
                onPress={() => setCountryModalVisible(true)}
                style={styles.countryButton}
              >
                <Text style={styles.countryButtonText}>
                  {currentCountry.flag} {currentCountry.code}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* Phone number input */}
              <TextInput
                style={styles.phoneInput}
                keyboardType="phone-pad"
                placeholder="(555) 000-0000"
                placeholderTextColor={theme.colors.muted}
                value={phone}
                onChangeText={setPhone}
                onSubmitEditing={handleSend}
              />
            </View>

            <TouchableOpacity
              onPress={handleSend}
              disabled={!phone.trim() || loading}
              style={[
                styles.primaryButton,
                (!phone.trim() || loading) && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Send code</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.consentText}>
              By continuing you agree to receive an SMS verification code.
            </Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.label}>6-digit code</Text>
            
            {/* Custom styled code boxes */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => otpInputRef.current?.focus()}
              style={styles.otpGrid}
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const digit = code[i] || '';
                const isFocused = i === code.length;
                return (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      isFocused ? styles.otpBoxFocused : null,
                    ]}
                  >
                    <Text style={styles.otpDigit}>{digit}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* Invisible real text input */}
            <TextInput
              ref={otpInputRef}
              style={styles.invisibleInput}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={handleCodeChange}
              autoFocus
            />

            <TouchableOpacity
              onPress={handleVerify}
              disabled={code.length !== 6 || loading}
              style={[
                styles.primaryButton,
                (code.length !== 6 || loading) && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirm code</Text>
              )}
            </TouchableOpacity>

            <View style={styles.otpFooter}>
              <TouchableOpacity onPress={() => setPhase('phone')}>
                <Text style={styles.footerLink}>← Change number</Text>
              </TouchableOpacity>

              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Resend in 0:{countdown.toString().padStart(2, '0')}
                </Text>
              ) : (
                <TouchableOpacity onPress={handleSend}>
                  <Text style={styles.footerLink}>Resend code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Country selection Modal */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCountryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryOption}
                  onPress={() => {
                    setCountry(item.code);
                    setCountryModalVisible(false);
                  }}
                >
                  <Text style={styles.countryOptionText}>
                    {item.flag} {item.name} ({item.code})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
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
    lineHeight: 34,
  },
  description: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 24,
    fontFamily: theme.fonts.sans,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '500',
    marginBottom: 16,
    fontFamily: theme.fonts.sansMedium,
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    fontFamily: theme.fonts.sansMedium,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    height: 48,
  },
  countryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
  },
  dropdownArrow: {
    fontSize: 10,
    color: theme.colors.muted,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    height: 48,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.sansBold,
  },
  consentText: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: theme.fonts.sans,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.inputFocusBg,
  },
  otpBoxFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.sansBold,
  },
  invisibleInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: theme.fonts.sansMedium,
  },
  countdownText: {
    fontSize: 14,
    color: theme.colors.muted,
    fontFamily: theme.fonts.sans,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: theme.fonts.sansBold,
  },
  countryOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 208, 188, 0.2)',
  },
  countryOptionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
  },
});
