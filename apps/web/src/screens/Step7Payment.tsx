import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Tab = 'key' | 'card';

function detectBrand(num: string): string {
  if (/^4/.test(num))        return 'Visa';
  if (/^5[1-5]/.test(num))   return 'Mastercard';
  if (/^3[47]/.test(num))    return 'Amex';
  return '';
}

export default function Step7Payment() {
  const [, navigate] = useLocation();
  const [tab, setTab] = React.useState<Tab>('key');
  const [activationKey, setActivationKey] = React.useState('');
  const [cardNum, setCardNum] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [keyValid, setKeyValid] = React.useState<boolean | null>(null);

  const brand = detectBrand(cardNum.replace(/\s/g, ''));

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');

  const handleKeySubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setKeyValid(activationKey.length >= 8);
      if (activationKey.length >= 8) setTimeout(() => navigate('/step/8'), 800);
    }, 1000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/step/8'); }, 1200);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 1rem',
    border: '1px solid #DDD0BC',
    borderRadius: 8,
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#1C1A18',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '0.5rem',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: active ? 'white' : 'transparent',
    color: active ? '#1C1A18' : '#9B8570',
    border: 'none',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.07)' : 'none',
    transition: 'all 150ms',
  });

  return (
    <OnboardingLayout currentStep={7}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 7 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          Activate your profile
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9B8570' }}>
          Use an activation key from your institution, or subscribe directly.
        </p>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-lg mb-6" style={{ backgroundColor: '#F5EEE4' }}>
          <button onClick={() => setTab('key')}  style={tabStyle(tab === 'key')}>Activation key</button>
          <button onClick={() => setTab('card')} style={tabStyle(tab === 'card')}>Pay by card</button>
        </div>

        {tab === 'key' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Activation key</label>
              <input
                value={activationKey}
                onChange={e => { setActivationKey(e.target.value.toUpperCase()); setKeyValid(null); }}
                placeholder="BEXO-XXXX-XXXX"
                style={{
                  ...inputStyle,
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  letterSpacing: '0.1em',
                  borderColor: keyValid === false ? '#D32F2F' : keyValid === true ? '#6B8F71' : '#DDD0BC',
                }}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = keyValid === false ? '#D32F2F' : keyValid === true ? '#6B8F71' : '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
              />
              {keyValid === false && (
                <p className="text-xs mt-1" style={{ color: '#D32F2F' }}>That key doesn't look right — please check and try again.</p>
              )}
              {keyValid === true && (
                <p className="text-xs mt-1" style={{ color: '#6B8F71' }}>✓ Key accepted — redirecting…</p>
              )}
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5EEE4', border: '1px solid #DDD0BC' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#5C4A35' }}>📚 Institutional key</p>
              <p className="text-xs" style={{ color: '#9B8570' }}>
                Keys are issued by your university's careers service. Contact your careers office if you don't have one.
              </p>
            </div>

            <button
              onClick={handleKeySubmit}
              disabled={activationKey.length < 4 || loading}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C1440E', color: 'white', opacity: activationKey.length < 4 || loading ? 0.5 : 1, cursor: activationKey.length < 4 || loading ? 'not-allowed' : 'pointer' }}
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Validating…' : 'Activate'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCardSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>
                Card number {brand && <span style={{ color: '#C1440E' }}>({brand})</span>}
              </label>
              <input
                value={cardNum}
                onChange={e => setCardNum(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                style={{ ...inputStyle, fontFamily: 'JetBrains Mono, Menlo, monospace', letterSpacing: '0.05em' }}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Expiry</label>
                <input
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>CVV</label>
                <input
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/, '').slice(0, 4))}
                  placeholder="•••"
                  inputMode="numeric"
                  type="password"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Name on card</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ada Lovelace"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !cardNum || !expiry || !cvv || !name}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C1440E', color: 'white', opacity: loading || !cardNum ? 0.5 : 1, cursor: loading || !cardNum ? 'not-allowed' : 'pointer' }}
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Processing…' : 'Pay £9/month'}
            </button>
          </form>
        )}
      </div>
    </OnboardingLayout>
  );
}
