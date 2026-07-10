import * as React from 'react';
import { OnboardingLayout } from '../components/OnboardingLayout';

const SECTIONS = [
  { label: 'Personal info',  pct: 100 },
  { label: 'Education',      pct: 80 },
  { label: 'Experience',     pct: 65 },
  { label: 'Skills',         pct: 90 },
  { label: 'Projects',       pct: 40 },
  { label: 'Publications',   pct: 0 },
  { label: 'Certifications', pct: 0 },
  { label: 'References',     pct: 0 },
];

const STATS = [
  { label: 'Profile views',    value: '0',    note: 'Today' },
  { label: 'Connections',      value: '0',    note: 'All time' },
  { label: 'Profile strength', value: '68%',  note: '↑ Add projects' },
];

export default function Step9Publish() {
  const [copied, setCopied] = React.useState(false);
  const profileUrl = 'bexo.io/p/ada-lovelace';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://${profileUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <OnboardingLayout currentStep={9}>
      <div style={{ animation: 'fade-in 0.35s ease-out' }}>
        {/* Celebration */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#EEF6EE', border: '2px solid #C3DFC4' }}
          >
            <svg viewBox="0 0 52 52" className="w-9 h-9">
              <circle cx="26" cy="26" r="24" fill="none" stroke="#6B8F71" strokeWidth="3" />
              <path
                fill="none"
                stroke="#6B8F71"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27 l9 9 l15-16"
              />
            </svg>
          </div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
            You're live!
          </h1>
          <p className="text-sm" style={{ color: '#9B8570' }}>
            Your BEXO profile is published and ready to share.
          </p>
        </div>

        {/* Profile URL */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-6"
          style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}
        >
          <span className="flex-1 text-sm font-mono truncate" style={{ color: '#1C1A18' }}>
            {profileUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: copied ? '#EEF6EE' : '#F5EEE4',
              color: copied ? '#2D5A2E' : '#5C4A35',
              border: `1px solid ${copied ? '#C3DFC4' : '#DDD0BC'}`,
              cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied' : 'Copy URL'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {STATS.map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}
            >
              <p className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
                {stat.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9B8570' }}>{stat.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#C1440E' }}>{stat.note}</p>
            </div>
          ))}
        </div>

        {/* Section progress */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: '#1C1A18' }}>Profile sections</p>
          <div className="space-y-3">
            {SECTIONS.map(sec => (
              <div key={sec.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#5C4A35' }}>{sec.label}</span>
                  <span style={{ color: sec.pct === 100 ? '#6B8F71' : sec.pct === 0 ? '#B8A898' : '#C1440E' }}>
                    {sec.pct === 0 ? 'Not started' : `${sec.pct}%`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#ECD9C4' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${sec.pct}%`,
                      backgroundColor: sec.pct === 100 ? '#6B8F71' : '#C1440E',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 py-3 rounded-lg font-medium text-sm"
            style={{ backgroundColor: '#C1440E', color: 'white', cursor: 'pointer' }}
          >
            View my profile →
          </button>
          <button
            className="py-3 px-4 rounded-lg font-medium text-sm"
            style={{ backgroundColor: '#F5EEE4', border: '1px solid #DDD0BC', color: '#5C4A35', cursor: 'pointer' }}
          >
            Share
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
