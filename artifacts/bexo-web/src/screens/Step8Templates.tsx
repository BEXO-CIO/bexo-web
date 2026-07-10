import { useState } from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Clean. Confident. Classic.',
    description: 'White space does the talking. Perfect for tech roles and international applications.',
    previewBg: 'bg-[#F8F8F8]',
    accent: '#1C1A18',
    themes: ['#1C1A18', '#2D5A2E', '#1A2B5E', '#4A2B6B'],
    tag: 'Most popular',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Warm. Scholarly. Distinctive.',
    description: 'Serif headings and a cream palette signal depth of thought. Stands out in research and academia.',
    previewBg: 'bg-[#FDF6EC]',
    accent: '#C1440E',
    themes: ['#C1440E', '#7A6854', '#6B8F71', '#D4A853'],
    tag: 'BEXO signature',
  },
  {
    id: 'bold',
    name: 'Bold',
    tagline: 'Sharp. Modern. Unapologetic.',
    description: 'High contrast, strong type, vivid accent. Built for design, marketing, and creative roles.',
    previewBg: 'bg-[#1C1A18]',
    accent: '#E8D5B7',
    themes: ['#E8D5B7', '#C1440E', '#4FC3F7', '#A5D6A7'],
    tag: 'For creatives',
  },
];

function TemplatePreview({ template, selected }: { template: typeof TEMPLATES[0]; selected: boolean }) {
  const isBold = template.id === 'bold';
  const isEditorial = template.id === 'editorial';

  return (
    <div className={cn(
      template.previewBg,
      'rounded-lg overflow-hidden aspect-[3/4] relative p-4 flex flex-col gap-2',
    )}>
      {/* Mock profile header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: template.accent, color: isBold ? '#1C1A18' : 'white', opacity: 0.9 }}
        >
          PS
        </div>
        <div className="flex-1">
          <div
            className="h-2 rounded-full mb-1"
            style={{ backgroundColor: template.accent, opacity: 0.8, width: '70%' }}
          />
          <div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: template.accent, opacity: 0.35, width: '50%' }}
          />
        </div>
      </div>

      {/* Mock content blocks */}
      <div className="space-y-2 flex-1">
        {[85, 65, 75, 55].map((w, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full"
            style={{
              backgroundColor: template.accent,
              opacity: i === 0 ? 0.6 : 0.2,
              width: `${w}%`,
            }}
          />
        ))}

        {/* Mock section */}
        <div className="mt-3 pt-2 border-t" style={{ borderColor: template.accent + '25' }}>
          <div
            className="h-1 rounded-full mb-2"
            style={{ backgroundColor: template.accent, opacity: 0.7, width: '30%' }}
          />
          {[70, 90, 50].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full mb-1.5"
              style={{ backgroundColor: template.accent, opacity: 0.2, width: `${w}%` }}
            />
          ))}
        </div>

        {/* Mock skill chips */}
        <div className="flex gap-1 flex-wrap mt-2">
          {['React', 'ML', 'Python'].map(s => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded text-[6px] font-semibold"
              style={{
                backgroundColor: template.accent + (isBold ? '30' : '15'),
                color: template.accent,
                border: `1px solid ${template.accent}30`,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* BEXO watermark */}
      <div
        className="text-[8px] font-serif font-bold opacity-20 text-right"
        style={{ color: template.accent }}
      >
        BEXO
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-[#C1440E] rounded-full flex items-center justify-center shadow-md">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function Step8Templates() {
  const [, navigate] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState('editorial');
  const [selectedThemes, setSelectedThemes] = useState<Record<string, string>>({
    minimal: '#1C1A18',
    editorial: '#C1440E',
    bold: '#E8D5B7',
  });

  const chosen = TEMPLATES.find(t => t.id === selectedTemplate)!;

  return (
    <OnboardingLayout currentStep={8}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-[#C1440E] uppercase tracking-widest mb-2">Step 8 of 9</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1C1A18] leading-tight">
            Choose your canvas
          </h1>
          <p className="mt-3 text-[#7A6854] leading-relaxed">
            Every template showcases the same content — it's your aesthetic preference that differs.
            You can switch anytime after publishing.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map(t => (
            <div key={t.id} className="flex flex-col gap-3">
              {/* Preview card */}
              <button
                onClick={() => setSelectedTemplate(t.id)}
                className={cn(
                  'rounded-xl overflow-hidden transition-all',
                  selectedTemplate === t.id
                    ? 'ring-2 ring-[#C1440E] ring-offset-2 shadow-lg scale-[1.01]'
                    : 'ring-1 ring-[#DDD0BC] hover:ring-[#C1440E]/50 hover:shadow-md',
                )}
              >
                <TemplatePreview template={t} selected={selectedTemplate === t.id} />
              </button>

              {/* Template info */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <p className={cn(
                    'text-sm font-semibold',
                    selectedTemplate === t.id ? 'text-[#C1440E]' : 'text-[#1C1A18]',
                  )}>
                    {t.name}
                  </p>
                  {t.tag && (
                    <span className="text-[10px] font-medium text-[#9B8570] bg-[#ECD9C4] px-1.5 py-0.5 rounded-full">
                      {t.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#9B8570] mb-2">{t.tagline}</p>

                {/* Theme swatches */}
                <div className="flex gap-1.5">
                  {t.themes.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedTemplate(t.id);
                        setSelectedThemes(th => ({ ...th, [t.id]: color }));
                      }}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-all',
                        selectedThemes[t.id] === color && selectedTemplate === t.id
                          ? 'border-[#C1440E] scale-110 shadow-sm'
                          : 'border-transparent hover:border-[#DDD0BC]',
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected template detail */}
        <div className="p-4 bg-[#FAF8F4] rounded-xl border border-[#DDD0BC]">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0"
              style={{ backgroundColor: selectedThemes[selectedTemplate] + '20', border: `2px solid ${selectedThemes[selectedTemplate]}40` }}
            />
            <div>
              <p className="font-semibold text-[#1C1A18] text-sm">{chosen.name} template selected</p>
              <p className="text-xs text-[#9B8570] mt-0.5 leading-relaxed">{chosen.description}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/step/9')}
          className="w-full py-3 bg-[#C1440E] hover:bg-[#A33509] text-white font-medium rounded-lg text-base transition-colors"
        >
          Apply {chosen.name} template →
        </Button>
      </div>
    </OnboardingLayout>
  );
}
