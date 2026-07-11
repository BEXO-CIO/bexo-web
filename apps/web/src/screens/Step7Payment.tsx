import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client } from '../lib/api';

type Tab = 'key' | 'card';
type Plan = 'annual' | 'lifetime';

export default function Step7Payment() {
  const [, navigate] = useLocation();
  const [tab, setTab] = React.useState<Tab>('key');
  const [activationKey, setActivationKey] = React.useState('');
  
  // Card & Plan selections
  const [selectedPlan, setSelectedPlan] = React.useState<Plan>('annual');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [keyValid, setKeyValid] = React.useState<boolean | null>(null);
  const [polling, setPolling] = React.useState(false);

  // Poll for subscription activation status on backend
  React.useEffect(() => {
    if (!polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await client.getSubscriptionStatus();
        if (res && res.active) {
          setPolling(false);
          setLoading(false);
          navigate('/step/8');
        }
      } catch (e) {
        console.error('Error polling subscription status:', e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [polling]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleKeySubmit = async () => {
    setLoading(true);
    setError('');
    setKeyValid(null);
    try {
      const res = await client.redeemActivationKey(activationKey);
      if (res && res.success) {
        setKeyValid(true);
        setTimeout(() => navigate('/step/8'), 800);
      } else {
        setKeyValid(false);
        setError(res.message || 'Invalid activation key.');
      }
    } catch (err: any) {
      setKeyValid(false);
      setError(err.message || 'Key validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Load checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK.');
      }

      // 2. Call backend to create Razorpay Order
      const order = await client.request<{ orderId: string; amount: number; currency: string; notes: any; mock?: boolean }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan }),
      });

      // 3. Configure Razorpay Checkout options
      const options = {
        key: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_test_mockKeyId',
        amount: order.amount,
        currency: order.currency,
        name: 'BEXO',
        description: selectedPlan === 'annual' ? 'Annual Student Premium' : 'Lifetime Student Premium',
        order_id: order.orderId,
        handler: function () {
          // Razorpay callback. Start polling local status
          setPolling(true);
        },
        theme: {
          color: '#C1440E',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      // For test mode, also listen to close/fails or let user trigger developer mock capture below
    } catch (err: any) {
      setError(err.message || 'Could not initiate checkout.');
      setLoading(false);
    }
  };

  // Developer simulation helper for local testing
  const handleDevConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await client.request('/billing/dev-confirm', { method: 'POST', body: '{}' });
      // Poll immediately to trigger state redirect
      setPolling(true);
    } catch (err: any) {
      setError(err.message || 'Mock confirmation failed.');
      setLoading(false);
    }
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
      <div style={{ animation: 'fade-in 0.3s ease-out' }} className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 7 of 9</p>
          <h1 className="text-3xl mb-1 font-serif" style={{ color: '#1C1A18' }}>
            Activate your profile
          </h1>
          <p className="text-sm text-[#9B8570]">
            Use an activation key from your institution, or subscribe directly.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-lg" style={{ backgroundColor: '#F5EEE4' }}>
          <button onClick={() => { setTab('key'); setError(''); }} style={tabStyle(tab === 'key')}>Activation key</button>
          <button onClick={() => { setTab('card'); setError(''); }} style={tabStyle(tab === 'card')}>Pay by card</button>
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
              />
              {keyValid === false && (
                <p className="text-xs mt-1 text-[#D32F2F]">{error || "That key doesn't look right — please check and try again."}</p>
              )}
              {keyValid === true && (
                <p className="text-xs mt-1 text-[#6B8F71]">✓ Key accepted — redirecting…</p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-[#F5EEE4] border border-[#DDD0BC]">
              <p className="text-xs font-semibold mb-1 text-[#5C4A35]">📚 Institutional key</p>
              <p className="text-xs text-[#9B8570]">
                Keys are issued by your university's careers service. Contact your careers office if you don't have one.
              </p>
            </div>

            <button
              onClick={handleKeySubmit}
              disabled={activationKey.length < 4 || loading}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: '#C1440E', opacity: activationKey.length < 4 || loading ? 0.5 : 1, cursor: activationKey.length < 4 || loading ? 'not-allowed' : 'pointer' }}
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Validating…' : 'Activate'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Annual Card */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className="p-4 rounded-xl cursor-pointer border-2 transition bg-white"
                style={{ borderColor: selectedPlan === 'annual' ? '#C1440E' : '#DDD0BC' }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-sm text-[#1C1A18]">Annual Plan</span>
                  <span className="text-xs text-[#9B8570]">₹999/yr</span>
                </div>
                <p className="text-xs text-[#9B8570]">Perfect for students building portfolios during their final terms.</p>
              </div>

              {/* Lifetime Card */}
              <div
                onClick={() => setSelectedPlan('lifetime')}
                className="p-4 rounded-xl cursor-pointer border-2 transition bg-white"
                style={{ borderColor: selectedPlan === 'lifetime' ? '#C1440E' : '#DDD0BC' }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-sm text-[#1C1A18]">Lifetime Plan</span>
                  <span className="text-xs text-[#9B8570]">₹3,999</span>
                </div>
                <p className="text-xs text-[#9B8570]">Pay once, keep your portfolio address and template forever.</p>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              onClick={handleRazorpayPayment}
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: '#C1440E', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {polling ? 'Waiting for webhook confirmation…' : 'Processing Checkout…'}
                </>
              ) : (
                <>
                  💳 Pay {selectedPlan === 'annual' ? '₹999' : '₹3,999'} with Razorpay
                </>
              )}
            </button>

            {/* Local Developer shortcut */}
            <div className="pt-4 border-t border-[#DDD0BC]/40 flex flex-col items-center">
              <p className="text-[10px] uppercase font-bold text-[#9B8570] mb-2">Local Development Tools</p>
              <button
                type="button"
                onClick={handleDevConfirm}
                disabled={loading}
                className="px-4 py-1.5 rounded bg-[#F5EEE4] border border-[#DDD0BC] text-xs font-semibold text-[#5C4A35] hover:bg-[#EBDCC5]"
              >
                Simulate Payment Success (Bypass Razorpay Webhook)
              </button>
            </div>

          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
