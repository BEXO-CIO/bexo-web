import * as React from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { Button } from "@bexo/ui";

// Step Names
const STEPS = [
  { path: "/onboarding/step-1", title: "Welcome to BEXO", desc: "Create your account" },
  { path: "/onboarding/step-2", title: "Workspace Setup", desc: "Name your team environment" },
  { path: "/onboarding/step-3", title: "Personalize Profile", desc: "Tell us about your role" },
  { path: "/onboarding/step-4", title: "Invite Teammates", desc: "Bring your team on board" },
  { path: "/onboarding/step-5", title: "Connect Sources", desc: "Integrate Github & Slack" },
  { path: "/onboarding/step-6", title: "Custom Branding", desc: "Select color theme & logos" },
  { path: "/onboarding/step-7", title: "Choose Plan", desc: "Pick your tier" },
  { path: "/onboarding/step-8", title: "Billing Details", desc: "Secure your workspace" },
  { path: "/onboarding/step-9", title: "All Set!", desc: "Launch your workspace" },
];

function OnboardingLayout({ children, currentStepIdx }: { children: React.ReactNode; currentStepIdx: number }) {
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setLocation(STEPS[currentStepIdx + 1].path);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setLocation(STEPS[currentStepIdx - 1].path);
    }
  };

  const progressPercent = Math.round(((currentStepIdx + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            B
          </span>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
            BEXO
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Step {currentStepIdx + 1} of {STEPS.length}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-8 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-gray-800 pr-0 md:pr-8">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;
            return (
              <Link key={step.path} to={step.path}>
                <a className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                    : isCompleted 
                      ? "text-emerald-400 hover:bg-gray-900/50" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-gray-900/30"
                }`}>
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive 
                      ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                      : isCompleted 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-gray-800 text-gray-500"
                  }`}>
                    {isCompleted ? "✓" : idx + 1}
                  </span>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.desc}</div>
                  </div>
                </a>
              </Link>
            );
          })}
        </aside>

        {/* Dynamic Step Panel */}
        <main className="flex-1 flex flex-col justify-between bg-gray-900/30 border border-gray-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm min-h-[450px]">
          <div>
            {/* Top Progress bar */}
            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <div className="space-y-6">
              {children}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-800">
            <Button 
              variant="secondary" 
              onClick={handleBack} 
              disabled={currentStepIdx === 0}
              className="px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            >
              Back
            </Button>
            
            {currentStepIdx < STEPS.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={handleNext}
                className="px-6 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all"
              >
                Continue
              </Button>
            ) : (
              <Button 
                variant="primary"
                onClick={() => alert("Scaffold onboarding complete! Initiating BEXO App...")}
                className="px-6 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                Launch App
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <>
      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Welcome to BEXO</h2>
      <p className="text-gray-400">Let's set up your core infrastructure and configure your developer profile to bootstrap BEXO.</p>
      <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 space-y-4">
        <label className="block text-sm font-semibold text-gray-300">Choose your workspace slug</label>
        <div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500">
          <span className="inline-flex items-center px-3 bg-gray-800 border-r border-gray-700 text-gray-400 text-sm">bexo.app/</span>
          <input type="text" placeholder="my-awesome-team" className="flex-1 bg-gray-950 px-4 py-2 text-white outline-none" />
        </div>
      </div>
    </>
  );
}

function CreateStep({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <>
      <h2 className="text-3xl font-extrabold text-white">{title}</h2>
      <p className="text-gray-400">{desc}</p>
      <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 space-y-4">
        <div className="h-32 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-500">
          Placeholder Form Fields for Step {index}
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [location] = useLocation();

  // Redirect root to Step 1
  React.useEffect(() => {
    if (location === "/" || location === "") {
      window.location.hash = "/onboarding/step-1";
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/onboarding/step-1">
        <OnboardingLayout currentStepIdx={0}>
          <WelcomeStep />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-2">
        <OnboardingLayout currentStepIdx={1}>
          <CreateStep index={2} title="Workspace Settings" desc="Set up details about your company and billing defaults." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-3">
        <OnboardingLayout currentStepIdx={2}>
          <CreateStep index={3} title="Developer Profile" desc="Configure your role and preferred programming languages." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-4">
        <OnboardingLayout currentStepIdx={3}>
          <CreateStep index={4} title="Invite Team members" desc="Send email invitations to get your core team inside BEXO." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-5">
        <OnboardingLayout currentStepIdx={4}>
          <CreateStep index={5} title="Integrations" desc="Sync with your active Git repos and project management boards." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-6">
        <OnboardingLayout currentStepIdx={5}>
          <CreateStep index={6} title="Branding & Styles" desc="Upload logos and customize dashboard typography and base themes." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-7">
        <OnboardingLayout currentStepIdx={6}>
          <CreateStep index={7} title="Choose Subscriptions" desc="Select the plan that fits the size of your active pipelines." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-8">
        <OnboardingLayout currentStepIdx={7}>
          <CreateStep index={8} title="Verification & Billing" desc="Provide payment card info to enable your free trial period." />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/step-9">
        <OnboardingLayout currentStepIdx={8}>
          <CreateStep index={9} title="Confirm & Launch" desc="Everything is ready! Click below to enter the BEXO dashboard." />
        </OnboardingLayout>
      </Route>
      
      {/* Fallback */}
      <Route>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-gray-400">Page not found.</p>
          <Link href="/onboarding/step-1">
            <a className="text-indigo-400 hover:underline">Go to onboarding flow</a>
          </Link>
        </div>
      </Route>
    </Switch>
  );
}
