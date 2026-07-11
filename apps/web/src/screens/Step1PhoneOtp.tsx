import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client, setAccessToken } from '../lib/api';

type Phase = 'phone' | 'otp';

const COUNTRIES = [
  { code: '+1',  flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
];

export default function Step1PhoneOtp() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = React.useState<Phase>('phone');
  const [country, setCountry] = React.useState('+1');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [error, setError] = React.useState('');
  const otpRefs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

  React.useEffect(() => {
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
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs[idx - 1].current?.focus();
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    const fullPhone = `${country}${phone.replace(/\D/g, '')}`;
    const code = otp.join('');
    try {
      const res = await client.verifyOtp(fullPhone, code);
      setAccessToken(res.accessToken);
      navigate('/step/2');
    } catch (e: any) {
      setError(e.message || 'Invalid code submitted.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    border: '1px solid #DDD0BC',
    borderRadius: 8,
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    color: '#1C1A18',
    transition: 'border-color 150ms, box-shadow 150ms',
  };

  return (
    <OnboardingLayout currentStep={1}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        {/* Header */}
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 1 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          {phase === 'phone' ? 'Verify your phone' : 'Enter the code'}
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9B8570' }}>
          {phase === 'phone'
            ? 'We\'ll send a one-time code to confirm your number.'
            : `We texted a 6-digit code to ${country} ${phone}`}
        </p>

        {error && (
          <p className="text-sm mb-4 font-medium" style={{ color: '#E11D48' }}>
            {error}
          </p>
        )}

        {phase === 'phone' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Mobile number</label>
              <div className="flex gap-2">
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  style={{ ...inputBase, padding: '0.625rem 0.75rem', width: 100, flexShrink: 0, cursor: 'pointer' }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ ...inputBase, padding: '0.625rem 1rem', flex: 1, fontSize: 14 }}
                  onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!phone.trim() || loading}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C1440E', color: 'white', opacity: (!phone.trim() || loading) ? 0.55 : 1, cursor: (!phone.trim() || loading) ? 'not-allowed' : 'pointer' }}
            >
              {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Sending…' : 'Send code'}
            </button>

            <p className="text-xs text-center" style={{ color: '#9B8570' }}>
              By continuing you agree to receive an SMS verification code.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: '#1C1A18' }}>6-digit code</label>
              <div className="flex gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className="text-center text-xl font-semibold"
                    style={{
                      ...inputBase,
                      width: 52,
                      height: 56,
                      fontSize: 22,
                      borderColor: digit ? '#C1440E' : '#DDD0BC',
                      backgroundColor: digit ? '#FDF0EB' : 'white',
                      transition: 'all 150ms',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                    onBlur={e => { if (!digit) { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; } }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={otp.some(d => !d) || loading}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C1440E', color: 'white', opacity: (otp.some(d => !d) || loading) ? 0.55 : 1, cursor: (otp.some(d => !d) || loading) ? 'not-allowed' : 'pointer' }}
            >
              {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Verifying…' : 'Confirm code'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button onClick={() => setPhase('phone')} className="hover:underline" style={{ color: '#C1440E', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Change number
              </button>
              {countdown > 0 ? (
                <span style={{ color: '#9B8570' }}>Resend in 0:{countdown.toString().padStart(2, '0')}</span>
              ) : (
                <button onClick={() => setCountdown(59)} style={{ color: '#C1440E', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Resend code
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
