import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client } from '../lib/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS  = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 17 - i);

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Any pronouns'];

export default function Step3NameDob() {
  const [, navigate] = useLocation();
  const [form, setForm] = React.useState({ first: '', last: '', day: '', month: '', year: '', nationality: '', pronouns: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const isValid = form.first && form.last && form.day && form.month && form.year && !loading;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    
    const monthIndex = MONTHS.indexOf(form.month) + 1;
    const dob = `${form.year}-${monthIndex.toString().padStart(2, '0')}-${form.day.padStart(2, '0')}`;
    const name = `${form.first} ${form.last}`;
    
    try {
      await client.patchProfile({ name, dob });
      navigate('/step/4');
    } catch (e: any) {
      setError(e.message || 'Failed to save details.');
    } finally {
      setLoading(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.625rem 0.875rem',
    border: '1px solid #DDD0BC',
    borderRadius: 8,
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#1C1A18',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239B8570'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '14px',
    paddingRight: 30,
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
    <OnboardingLayout currentStep={3}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 3 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          Tell us about yourself
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9B8570' }}>This goes on your public profile — keep it professional.</p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>First name</label>
              <input value={form.first} onChange={e => set('first', e.target.value)} placeholder="Ada" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Last name</label>
              <input value={form.last} onChange={e => set('last', e.target.value)} placeholder="Lovelace" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Date of birth</label>
            <div className="flex gap-2">
              <select value={form.day} onChange={e => set('day', e.target.value)} style={selectStyle}>
                <option value="">Day</option>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={form.month} onChange={e => set('month', e.target.value)} style={{ ...selectStyle, flex: 2 }}>
                <option value="">Month</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={form.year} onChange={e => set('year', e.target.value)} style={selectStyle}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1C1A18' }}>Nationality <span style={{ color: '#9B8570' }}>(optional)</span></label>
            <input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. British, Nigerian, Brazilian…" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1C1A18' }}>Pronouns <span style={{ color: '#9B8570' }}>(optional)</span></label>
            <div className="flex flex-wrap gap-2">
              {PRONOUNS.map(p => (
                <button
                  key={p}
                  onClick={() => set('pronouns', form.pronouns === p ? '' : p)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: form.pronouns === p ? '#C1440E' : '#F5EEE4',
                    color: form.pronouns === p ? 'white' : '#5C4A35',
                    border: `1px solid ${form.pronouns === p ? '#A33509' : '#DDD0BC'}`,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-center" style={{ color: '#E11D48' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#C1440E', color: 'white', opacity: (isValid && !loading) ? 1 : 0.5, cursor: (isValid && !loading) ? 'pointer' : 'not-allowed' }}
          >
            {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
            {loading ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
