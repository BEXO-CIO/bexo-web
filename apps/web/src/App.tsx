import * as React from 'react';
import { Switch, Route, useLocation, Redirect } from 'wouter';

// ── Step components (lazy-loaded for perf) ────────────────────────────────
// These are the 9 onboarding screens. Each is a standalone component
// following the same OnboardingLayout pattern.
import Step1PhoneOtp from './screens/Step1PhoneOtp';
import Step2GoogleAuth from './screens/Step2GoogleAuth';
import Step3NameDob from './screens/Step3NameDob';
import Step4ResumeUpload from './screens/Step4ResumeUpload';
import Step5PhotoUpload from './screens/Step5PhotoUpload';
import Step6About from './screens/Step6About';
import Step7Payment from './screens/Step7Payment';
import Step8Templates from './screens/Step8Templates';
import Step9Publish from './screens/Step9Publish';

/**
 * Root application router.
 *
 * Route scheme:
 *   /            → redirect to /step/1
 *   /step/:num   → onboarding step (1–9)
 */
export default function App() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/step/1" />
      </Route>
      <Route path="/step/1" component={Step1PhoneOtp} />
      <Route path="/step/2" component={Step2GoogleAuth} />
      <Route path="/step/3" component={Step3NameDob} />
      <Route path="/step/4" component={Step4ResumeUpload} />
      <Route path="/step/5" component={Step5PhotoUpload} />
      <Route path="/step/6" component={Step6About} />
      <Route path="/step/7" component={Step7Payment} />
      <Route path="/step/8" component={Step8Templates} />
      <Route path="/step/9" component={Step9Publish} />
      {/* Fallback */}
      <Route>
        <Redirect to="/step/1" />
      </Route>
    </Switch>
  );
}
