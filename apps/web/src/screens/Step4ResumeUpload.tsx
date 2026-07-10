import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Phase = 'idle' | 'uploading' | 'parsing' | 'done';

const PARSE_STEPS = [
  'Reading document structure…',
  'Extracting education history…',
  'Identifying work experience…',
  'Detecting skills & certifications…',
  'Building your profile…',
];

export default function Step4ResumeUpload() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [uploadPct, setUploadPct] = React.useState(0);
  const [parseStep, setParseStep] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState('');

  const startUpload = (name: string) => {
    setFileName(name);
    setPhase('uploading');
    setUploadPct(0);
    const iv = setInterval(() => {
      setUploadPct(p => {
        if (p >= 100) {
          clearInterval(iv);
          setPhase('parsing');
          setParseStep(0);
          let step = 0;
          const ps = setInterval(() => {
            step++;
            setParseStep(step);
            if (step >= PARSE_STEPS.length) {
              clearInterval(ps);
              setTimeout(() => setPhase('done'), 600);
            }
          }, 700);
          return 100;
        }
        return p + 8;
      });
    }, 80);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) startUpload(file.name);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startUpload(file.name);
  };

  return (
    <OnboardingLayout currentStep={4}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 4 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          Upload your résumé
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9B8570' }}>
          We'll extract your education, experience, and skills automatically.
        </p>

        {phase === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="rounded-xl p-10 text-center transition-all"
            style={{
              border: `2px dashed ${dragging ? '#C1440E' : '#DDD0BC'}`,
              backgroundColor: dragging ? '#FDF0EB' : '#FAF8F4',
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5EEE4' }}>
              <svg className="w-7 h-7" fill="none" stroke="#C1440E" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium mb-1" style={{ color: '#1C1A18' }}>Drop your résumé here</p>
            <p className="text-sm mb-4" style={{ color: '#9B8570' }}>PDF, DOC, or DOCX — up to 10 MB</p>
            <label className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer inline-block" style={{ backgroundColor: '#C1440E', color: 'white' }}>
              Browse files
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
            </label>
          </div>
        )}

        {phase === 'uploading' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: '#FAF8F4', border: '1px solid #DDD0BC' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDF0EB' }}>
                <svg className="w-5 h-5" fill="none" stroke="#C1440E" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1C1A18' }}>{fileName}</p>
                <p className="text-xs" style={{ color: '#9B8570' }}>Uploading… {uploadPct}%</p>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#ECD9C4' }}>
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{ width: `${uploadPct}%`, backgroundColor: '#C1440E' }}
              />
            </div>
          </div>
        )}

        {phase === 'parsing' && (
          <div className="space-y-3">
            {PARSE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: i <= parseStep ? '#FAF8F4' : 'transparent' }}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: i < parseStep ? '#6B8F71' : i === parseStep ? '#C1440E' : '#DDD0BC',
                  }}
                >
                  {i < parseStep ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i === parseStep ? (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : null}
                </div>
                <span className="text-sm" style={{ color: i <= parseStep ? '#1C1A18' : '#B8A898' }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {phase === 'done' && (
          <div className="space-y-4" style={{ animation: 'fade-in 0.4s ease-out' }}>
            <div className="rounded-xl p-5" style={{ backgroundColor: '#EEF6EE', border: '1px solid #C3DFC4' }}>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="#6B8F71" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold" style={{ color: '#2D5A2E' }}>Résumé parsed successfully</p>
              </div>
              <p className="text-xs pl-6" style={{ color: '#6B8F71' }}>2 degrees · 3 roles · 12 skills detected</p>
            </div>
            <button
              onClick={() => navigate('/step/5')}
              className="w-full py-3 rounded-lg font-medium text-sm"
              style={{ backgroundColor: '#C1440E', color: 'white', cursor: 'pointer' }}
            >
              Continue →
            </button>
            <button
              onClick={() => navigate('/step/5')}
              className="w-full py-2 text-sm"
              style={{ color: '#9B8570', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Skip this step
            </button>
          </div>
        )}

        {phase === 'idle' && (
          <button
            onClick={() => navigate('/step/5')}
            className="w-full py-2 mt-4 text-sm"
            style={{ color: '#9B8570', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip for now
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}
