import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client, setAccessToken } from '../lib/api';

export default function Step2GoogleAuth() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [emailMode, setEmailMode] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      // In local dev, we pass a mock token which is accepted by our updated backend
      const res = await client.googleAuth('mock_google_id_token_123456');
      setAccessToken(res.accessToken);
      navigate('/step/3');
    } catch (e: any) {
      setError(e.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Email/password is a fallback mock flow
    setTimeout(() => { 
      setLoading(false); 
      navigate('/step/3'); 
    }, 1000);
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

  return (
    <OnboardingLayout currentStep={2}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 2 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          Create your account
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9B8570' }}>
          Sign in with Google for the fastest setup, or use your email.
        </p>

        {error && (
          <p className="text-sm mb-4 font-medium" style={{ color: '#E11D48' }}>
            {error}
          </p>
        )}

        {!emailMode ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium text-sm transition-all"
              style={{ backgroundColor: 'white', border: '1px solid #DDD0BC', color: '#1C1A18', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer' }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin-slow" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? 'Connecting…' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: '#DDD0BC' }} />
              <span className="text-xs" style={{ color: '#9B8570' }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#DDD0BC' }} />
            </div>

            <button
              onClick={() => setEmailMode(true)}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all"
              style={{ backgroundColor: '#F5EEE4', border: '1px solid #DDD0BC', color: '#5C4A35', cursor: 'pointer' }}
            >
              Continue with email
            </button>

            <p className="text-xs text-center" style={{ color: '#9B8570' }}>
              Already have an account?{' '}
              <button onClick={() => navigate('/step/3')} style={{ color: '#C1440E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Sign in
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C1440E', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
            <button type="button" onClick={() => setEmailMode(false)} className="w-full text-sm" style={{ color: '#9B8570', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Back to Google sign-in
            </button>
          </form>
        )}
      </div>
    </OnboardingLayout>
  );
}
