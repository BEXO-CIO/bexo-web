import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Clean whitespace, elegant typography. Lets your work speak.',
    themes: ['#FFFFFF', '#F5F5F5', '#F0EBE3', '#E8E4DF'],
    mockupBg: '#FAFAFA',
    mockupAccent: '#333333',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    desc: 'Warm serif headings, cream pages. Academic-meets-creative.',
    themes: ['#FDF6EC', '#F0E6D3', '#EDE0D4', '#E8D5C4'],
    mockupBg: '#FDF6EC',
    mockupAccent: '#C1440E',
  },
  {
    id: 'bold',
    name: 'Bold',
    desc: 'High contrast, strong grid. Makes a statement at first glance.',
    themes: ['#0A0908', '#1C1A18', '#2D2A26', '#3D3830'],
    mockupBg: '#0A0908',
    mockupAccent: '#C1440E',
  },
];

export default function Step8Templates() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = React.useState('editorial');
  const [themes, setThemes] = React.useState<Record<string, string>>({ minimal: '#FFFFFF', editorial: '#FDF6EC', bold: '#0A0908' });

  return (
    <OnboardingLayout currentStep={8}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 8 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          Choose your template
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9B8570' }}>
          Pick the look that fits your story. You can change this later.
        </p>

        <div className="space-y-4">
          {TEMPLATES.map(t => {
            const isSelected = selected === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelected(t.id)}
                className="rounded-xl overflow-hidden cursor-pointer transition-all"
                style={{
                  border: `2px solid ${isSelected ? '#C1440E' : '#DDD0BC'}`,
                  boxShadow: isSelected ? '0 0 0 3px rgba(193,68,14,0.12)' : 'none',
                }}
              >
                {/* Mini mockup */}
                <div
                  className="h-28 flex items-center justify-center relative"
                  style={{ backgroundColor: themes[t.id] }}
                >
                  <div className="absolute inset-4 flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full" style={{ backgroundColor: t.mockupAccent, opacity: 0.2 }} />
                    <div className="flex-1 space-y-1 pt-1">
                      <div className="h-2.5 rounded-sm w-3/4" style={{ backgroundColor: t.mockupAccent, opacity: 0.5 }} />
                      <div className="h-1.5 rounded-sm w-1/2" style={{ backgroundColor: t.mockupAccent, opacity: 0.25 }} />
                      <div className="h-1.5 rounded-sm w-2/3" style={{ backgroundColor: t.mockupAccent, opacity: 0.2 }} />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C1440E' }}>
                      <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info + color swatches */}
                <div className="p-4" style={{ backgroundColor: 'white' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold" style={{ color: '#1C1A18' }}>{t.name}</p>
                    <div className="flex gap-1.5">
                      {t.themes.map(color => (
                        <button
                          key={color}
                          onClick={e => {
                            e.stopPropagation();
                            setSelected(t.id);
                            setThemes(th => ({ ...th, [t.id]: color }));
                          }}
                          className="rounded-full transition-all"
                          style={{
                            width: 16,
                            height: 16,
                            backgroundColor: color,
                            border: `2px solid ${themes[t.id] === color ? '#C1440E' : '#DDD0BC'}`,
                            cursor: 'pointer',
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: '#9B8570' }}>{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/step/9')}
          className="w-full py-3 rounded-lg font-medium text-sm mt-6"
          style={{ backgroundColor: '#C1440E', color: 'white', cursor: 'pointer' }}
        >
          Use {TEMPLATES.find(t => t.id === selected)?.name} template →
        </button>
      </div>
    </OnboardingLayout>
  );
}
