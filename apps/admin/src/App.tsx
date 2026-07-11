import { Button } from "@bexo/ui";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="h-8 w-8 rounded-lg bg-pink-600 flex items-center justify-center font-bold text-white text-xl">
            B
          </span>
          <span className="font-extrabold text-xl tracking-tight">
            BEXO Admin
          </span>
          <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            Console
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 font-medium">admin@bexo.app</span>
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
            A
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 space-y-6">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Management</div>
            <nav className="space-y-1">
              <a href="#users" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 font-medium text-sm">
                <span>Users & Profiles</span>
              </a>
              <a href="#assets" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm">
                <span>Assets Management</span>
              </a>
              <a href="#templates" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm">
                <span>Template Library</span>
              </a>
            </nav>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System</div>
            <nav className="space-y-1">
              <a href="#billing" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm">
                <span>Billing & Logs</span>
              </a>
              <a href="#status" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm">
                <span>Server Status</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 space-y-8 max-w-5xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Profiles</h1>
              <p className="text-sm text-gray-500 mt-1">Review, activate, and moderate all active BEXO accounts.</p>
            </div>
            <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm">
              Add New User
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 font-semibold uppercase">Total Users</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">1,248</div>
              <div className="text-xs text-green-600 font-medium mt-1">↑ 12% from last week</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 font-semibold uppercase">Templates Active</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">42</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Ready for deployment</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 font-semibold uppercase">Billing (MRR)</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">$24,500</div>
              <div className="text-xs text-green-600 font-medium mt-1">↑ 8% from last month</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900 text-sm">Active Accounts</div>
            <div className="p-6 text-center text-sm text-gray-400">
              User Moderation Table will go here.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
