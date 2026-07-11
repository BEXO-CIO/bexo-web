import * as React from 'react';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client } from '../lib/api';

interface SectionProgress {
  label: string;
  pct: number;
}

export default function Step9Publish() {
  const [copied, setCopied] = React.useState(false);
  const [handle, setHandle] = React.useState('');
  const [completionScore, setCompletionScore] = React.useState<number | null>(null);
  const [sections, setSections] = React.useState<SectionProgress[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function publishAndFetchStats() {
      try {
        setLoading(true);
        setError('');

        // 1. Trigger backend publishing
        const savedTemplateId = localStorage.getItem('bexo_selected_template_id');
        const savedThemeId = localStorage.getItem('bexo_selected_theme_id');

        const publishRes = await client.publishPortfolio({
          selected_template_id: savedTemplateId || undefined,
          selected_theme_id: savedThemeId || undefined,
        });
        if (publishRes && publishRes.portfolio) {
          setHandle(publishRes.portfolio.handle);
        }

        // 2. Fetch completion score
        const scoreRes = await client.getCompletionScore();
        setCompletionScore(scoreRes.score);

        // 3. Fetch all 8 profile sections to calculate dynamic progress
        const sectionTypes = ['about', 'education', 'experience', 'projects', 'certificates', 'achievements', 'research', 'contact'];
        const sectionProgressList: SectionProgress[] = [];

        for (const type of sectionTypes) {
          try {
            const sec = await client.getProfileSection(type);
            const isCompleted = sec && sec.entries && sec.entries.length > 0;
            sectionProgressList.push({
              label: type === 'about' ? 'Bio & Skills' : type.charAt(0).toUpperCase() + type.slice(1),
              pct: isCompleted ? 100 : 0
            });
          } catch {
            sectionProgressList.push({
              label: type === 'about' ? 'Bio & Skills' : type.charAt(0).toUpperCase() + type.slice(1),
              pct: 0
            });
          }
        }
        setSections(sectionProgressList);

      } catch (err: any) {
        setError(err.message || 'Failed to publish portfolio.');
      } finally {
        setLoading(false);
      }
    }

    publishAndFetchStats();
  }, []);

  const profileUrl = handle ? `${handle}.mybexo.com` : 'loading...';
  const renderUrl = handle ? `http://localhost:3000/${handle}` : '#';

  const handleCopy = async () => {
    if (!handle) return;
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
            {loading ? 'Publishing portfolio...' : "You're live!"}
          </h1>
          <p className="text-sm" style={{ color: '#9B8570' }}>
            {loading ? 'Please wait while we set up your live portfolio.' : 'Your BEXO profile is published and ready to share.'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium border border-red-200">
            {error}
          </div>
        )}

        {/* Profile URL */}
        {!loading && handle && (
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
        )}

        {/* Stats (Real Profile Strength Score) */}
        {!loading && completionScore !== null && (
          <div className="mb-6">
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}
            >
              <p className="text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
                {completionScore}%
              </p>
              <p className="text-xs mt-1 uppercase tracking-wider font-bold" style={{ color: '#9B8570' }}>Profile strength</p>
              <p className="text-xs mt-1" style={{ color: '#C1440E' }}>
                {completionScore === 100 ? '🎉 All sections complete!' : '↑ Fill more sections in Step 6 to reach 100%'}
              </p>
            </div>
          </div>
        )}

        {/* Section progress */}
        {!loading && sections.length > 0 && (
          <div className="rounded-xl p-5" style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}>
            <p className="text-sm font-semibold mb-4" style={{ color: '#1C1A18' }}>Profile sections</p>
            <div className="space-y-3">
              {sections.map(sec => (
                <div key={sec.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#5C4A35' }}>{sec.label}</span>
                    <span style={{ color: sec.pct === 100 ? '#6B8F71' : '#B8A898' }}>
                      {sec.pct === 100 ? 'Completed' : 'Not started'}
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
        )}

        {!loading && (
          <div className="mt-6 flex gap-3">
            <a
              href={renderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-lg font-medium text-sm text-center block"
              style={{ backgroundColor: '#C1440E', color: 'white', cursor: 'pointer' }}
            >
              View my portfolio →
            </a>
            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-lg font-medium text-sm"
              style={{ backgroundColor: '#F5EEE4', border: '1px solid #DDD0BC', color: '#5C4A35', cursor: 'pointer' }}
            >
              Share
            </button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
