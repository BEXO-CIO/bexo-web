import * as React from 'react';
import { useLocation } from 'wouter';

const STEPS = [
  { num: 1, title: 'Verify Phone',   desc: 'Confirm your number' },
  { num: 2, title: 'Sign In',        desc: 'Google or email' },
  { num: 3, title: 'Personal Info',  desc: 'Name & date of birth' },
  { num: 4, title: 'Resume',         desc: 'Upload & parse' },
  { num: 5, title: 'Profile Photo',  desc: 'Add a face to the name' },
  { num: 6, title: 'About',          desc: 'Your story' },
  { num: 7, title: 'Activation',     desc: 'Unlock your profile' },
  { num: 8, title: 'Choose Template', desc: 'Pick your aesthetic' },
  { num: 9, title: 'Go Live',        desc: 'Publish & share' },
];

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
}

export function OnboardingLayout({ children, currentStep }: OnboardingLayoutProps) {
  const [, navigate] = useLocation();
  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: '#FDF6EC' }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex w-[300px] flex-shrink-0 flex-col px-8 py-10 border-r"
        style={{ backgroundColor: '#F0E6D3', borderColor: '#DDD0BC' }}
      >
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#C1440E' }}>
              <span className="text-white font-bold text-sm tracking-widest">B</span>
            </div>
            <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1C1A18' }}>
              BEXO
            </span>
          </div>
          <p className="mt-2 text-xs uppercase font-medium tracking-wide" style={{ color: '#9B8570' }}>
            Student Portfolio Builder
          </p>
        </div>

        {/* Step list */}
        <nav className="flex-1 space-y-1">
          {STEPS.map(step => {
            const isComplete = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            const isFuture  = step.num > currentStep;

            return (
              <button
                key={step.num}
                onClick={() => !isFuture && navigate(`/step/${step.num}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: isCurrent ? 'white' : 'transparent',
                  boxShadow: isCurrent ? '0 1px 3px 0 rgba(30,26,24,0.07)' : 'none',
                  opacity: isFuture ? 0.5 : 1,
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                <span
                  className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: isCurrent ? '#C1440E' : isComplete ? '#6B8F71' : '#DDD0BC',
                    color: isCurrent || isComplete ? 'white' : '#9B8570',
                  }}
                >
                  {isComplete ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.num}
                </span>
                <div className="hidden md:block text-left">
                  <p
                    className="text-sm font-medium leading-tight"
                    style={{ color: isCurrent ? '#1C1A18' : isComplete ? '#5C4A35' : '#9B8570' }}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9B8570' }}>{step.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Progress footer */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #DDD0BC' }}>
          <div className="flex justify-between text-xs mb-2" style={{ color: '#9B8570' }}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#DDD0BC' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: '#C1440E' }}
            />
          </div>
          <p className="mt-3 text-xs" style={{ color: '#9B8570' }}>
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: '#F0E6D3', borderColor: '#DDD0BC' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded flex items-center justify-center" style={{ backgroundColor: '#C1440E' }}>
            <span className="text-white font-bold text-xs">B</span>
          </div>
          <span className="font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>BEXO</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: '#9B8570' }}>
            Step {currentStep}/{STEPS.length}
          </span>
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#DDD0BC' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: '#C1440E' }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col lg:justify-center min-h-screen pt-16 lg:pt-0">
        <div className="w-full max-w-2xl mx-auto px-6 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
