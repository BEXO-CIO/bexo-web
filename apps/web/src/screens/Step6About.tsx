import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';

const SUGGESTED_SKILLS = [
  'Python','React','Machine Learning','Data Analysis','Public Speaking',
  'Research','TypeScript','Product Management','UI/UX','SQL',
  'Leadership','Communication',
];

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
  { key: 'github',   label: 'GitHub',   placeholder: 'github.com/yourname' },
  { key: 'portfolio',label: 'Portfolio',placeholder: 'yoursite.com' },
];

const BIO_LIMIT = 280;

export default function Step6About() {
  const [, navigate] = useLocation();
  const [bio, setBio] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [customSkill, setCustomSkill] = React.useState('');
  const [links, setLinks] = React.useState<Record<string, string>>({});

  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setCustomSkill('');
  };

  const completion = Math.min(100, Math.round(
    ((bio.length > 20 ? 40 : 0) + (skills.length >= 3 ? 40 : skills.length * 13) + (Object.values(links).some(Boolean) ? 20 : 0))
  ));

  return (
    <OnboardingLayout currentStep={6}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 6 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          About you
        </h1>
        <p className="text-sm mb-6" style={{ color: '#9B8570' }}>
          Share your story, skills, and where people can find you.
        </p>

        {/* Completion bar */}
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}>
          <div className="flex justify-between text-xs mb-2">
            <span className="font-medium" style={{ color: '#1C1A18' }}>Profile completeness</span>
            <span style={{ color: '#C1440E' }}>{completion}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#ECD9C4' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completion}%`, backgroundColor: '#C1440E' }} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Bio */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-sm font-medium" style={{ color: '#1C1A18' }}>Bio</label>
              <span className="text-xs" style={{ color: bio.length > BIO_LIMIT ? '#D32F2F' : '#9B8570' }}>
                {bio.length}/{BIO_LIMIT}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              placeholder="Final-year Computer Science student at UCL, specialising in ML and product design. Previously interned at DeepMind…"
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid #DDD0BC',
                borderRadius: 8,
                backgroundColor: 'white',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#1C1A18',
                resize: 'vertical',
              }}
              onFocus={e => { e.target.style.borderColor = '#C1440E'; e.target.style.boxShadow = '0 0 0 3px rgba(193,68,14,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#DDD0BC'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1C1A18' }}>Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_SKILLS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: skills.includes(s) ? '#C1440E' : '#F5EEE4',
                    color: skills.includes(s) ? 'white' : '#5C4A35',
                    border: `1px solid ${skills.includes(s) ? '#A33509' : '#DDD0BC'}`,
                    cursor: 'pointer',
                  }}
                >
                  {skills.includes(s) ? '✓ ' : '+ '}{s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                placeholder="Add custom skill…"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.875rem',
                  border: '1px solid #DDD0BC',
                  borderRadius: 8,
                  backgroundColor: 'white',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  color: '#1C1A18',
                }}
                onFocus={e => { e.target.style.borderColor = '#C1440E'; }}
                onBlur={e => { e.target.style.borderColor = '#DDD0BC'; }}
              />
              <button
                onClick={addCustomSkill}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#F5EEE4', border: '1px solid #DDD0BC', borderRadius: 8, color: '#5C4A35', cursor: 'pointer', fontSize: 13 }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Social links */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1C1A18' }}>Social links <span style={{ color: '#9B8570' }}>(optional)</span></label>
            <div className="space-y-2">
              {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-16 text-right flex-shrink-0" style={{ color: '#9B8570' }}>{label}</span>
                  <input
                    value={links[key] ?? ''}
                    onChange={e => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.875rem',
                      border: '1px solid #DDD0BC',
                      borderRadius: 8,
                      backgroundColor: 'white',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      color: '#1C1A18',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#C1440E'; }}
                    onBlur={e => { e.target.style.borderColor = '#DDD0BC'; }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/step/7')}
            className="w-full py-3 rounded-lg font-medium text-sm"
            style={{ backgroundColor: '#C1440E', color: 'white', cursor: 'pointer' }}
          >
            Save & continue →
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
