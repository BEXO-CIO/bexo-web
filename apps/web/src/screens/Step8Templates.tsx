import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client, getUserIdFromToken } from '../lib/api';

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimalist Portfolio',
    desc: 'Clean whitespace, elegant typography. Lets your work speak.',
  },
  {
    id: 'academic',
    name: 'Academic Portfolio',
    desc: 'Warm serif headings, cream pages. Academic-meets-creative.',
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    desc: 'High contrast, strong grid. Makes a statement at first glance.',
  },
];

export default function Step8Templates() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = React.useState('academic');
  const [themeVariants, setThemeVariants] = React.useState<any[]>([]);
  const [selectedThemeId, setSelectedThemeId] = React.useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = React.useState(true);

  const userId = getUserIdFromToken();

  // Load theme variants from API for selected template
  React.useEffect(() => {
    async function loadThemes() {
      try {
        const themes = await client.request<any[]>(`/templates/${selected}/themes`);
        setThemeVariants(themes);
        if (themes.length > 0) {
          setSelectedThemeId(themes[0].id);
        } else {
          setSelectedThemeId(null);
        }
      } catch (e) {
        console.error('Failed to load template theme variants', e);
      }
    }
    loadThemes();
    setIframeLoading(true);
  }, [selected]);

  const handleUseTemplate = () => {
    localStorage.setItem('bexo_selected_template_id', selected);
    if (selectedThemeId) {
      localStorage.setItem('bexo_selected_theme_id', selectedThemeId);
    } else {
      localStorage.removeItem('bexo_selected_theme_id');
    }
    navigate('/step/9');
  };

  const RENDERING_BASE_URL = (import.meta.env.VITE_RENDERING_URL as string) || 'http://localhost:3000';

  const previewUrl = userId 
    ? `${RENDERING_BASE_URL}/preview/${userId}/${selected}?theme=${selectedThemeId || ''}`
    : '';

  return (
    <OnboardingLayout currentStep={8}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }} className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#C1440E' }}>Step 8 of 9</p>
          <h1 className="text-3xl font-serif" style={{ color: '#1C1A18' }}>Choose your template</h1>
          <p className="text-sm" style={{ color: '#9B8570' }}>
            Pick the look that fits your story. You can change this later.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Template Selection List */}
          <div className="lg:col-span-5 space-y-4">
            {TEMPLATES.map(t => {
              const isSelected = selected === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className="rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-[#C1440E]/60 border"
                  style={{
                    borderColor: isSelected ? '#C1440E' : '#DDD0BC',
                    boxShadow: isSelected ? '0 1px 3px 0 rgba(193,68,14,0.1)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-[#1C1A18]">{t.name}</p>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: '#C1440E' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9B8570] leading-normal mb-3">{t.desc}</p>
                  
                  {/* Theme Variant Chips (if selected) */}
                  {isSelected && themeVariants.length > 0 && (
                    <div className="pt-2 border-t border-[#DDD0BC]/40">
                      <p className="text-[10px] uppercase font-bold text-[#9B8570] mb-1.5">Theme Variants</p>
                      <div className="flex flex-wrap gap-1.5">
                        {themeVariants.map(variant => (
                          <button
                            key={variant.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedThemeId(variant.id);
                              setIframeLoading(true);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                              selectedThemeId === variant.id 
                                ? 'bg-[#5C4A35] text-white' 
                                : 'bg-[#F5EEE4] text-[#5C4A35] hover:bg-[#EBDCC5]'
                            }`}
                          >
                            {variant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleUseTemplate}
              className="w-full py-3 rounded-lg font-medium text-sm text-center block text-white"
              style={{ backgroundColor: '#C1440E', cursor: 'pointer' }}
            >
              Use selected template →
            </button>
          </div>

          {/* Right Column: Live Embedded Preview Frame */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#DDD0BC] bg-white overflow-hidden shadow-sm flex flex-col">
              {/* Device Header */}
              <div className="px-4 py-2 border-b border-[#DDD0BC] bg-[#F5EEE4] flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-[10px] font-mono text-[#9B8570] ml-2 truncate max-w-xs">
                  {userId ? `bexo.io/preview/${userId}/${selected}` : 'bexo.io/preview'}
                </span>
              </div>
              
              {/* Iframe Viewport Container */}
              <div className="relative aspect-[4/3] bg-[#FDF6EC] flex items-center justify-center">
                {userId && previewUrl ? (
                  <>
                    {iframeLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F4] z-10 gap-2">
                        <span className="w-6 h-6 border-2 border-[#C1440E]/30 border-t-[#C1440E] rounded-full animate-spin" />
                        <span className="text-[11px] font-medium text-[#9B8570]">Loading live preview…</span>
                      </div>
                    )}
                    <iframe
                      src={previewUrl}
                      title="Portfolio Preview"
                      onLoad={() => setIframeLoading(false)}
                      className="w-full h-full border-none"
                    />
                  </>
                ) : (
                  <p className="text-xs text-[#9B8570]">Authenticate to see preview</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </OnboardingLayout>
  );
}
