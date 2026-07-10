import { Button } from "@bexo/ui";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xl">
            B
          </span>
          <span className="font-extrabold text-xl tracking-tight">
            BEXO
          </span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
          <a href="#features" className="hover:text-gray-950 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-gray-950 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-gray-950 transition-colors">About</a>
        </nav>
        <div>
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl w-full mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-950 leading-tight">
          The ultimate engine for{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
            next-gen apps
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
          BEXO is a unified workspace, template manager, rendering engine, and core data layer built to orchestrate and deploy enterprise-level experiences.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button variant="primary" className="bg-gray-950 text-white hover:bg-gray-900 px-6 py-3 font-semibold text-base shadow-lg">
            Start Free Trial
          </Button>
          <Button variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 font-semibold text-base">
            Read Docs
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-8">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <div>&copy; 2026 BEXO Technologies Inc. All rights reserved.</div>
          <div className="flex space-x-6">
            <a href="/privacy" className="hover:text-gray-905">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-905">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
