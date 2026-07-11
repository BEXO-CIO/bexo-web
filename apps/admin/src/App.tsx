import React, { useState, useEffect } from 'react';
import { Button } from "@bexo/ui";
import { client, setAccessToken } from "./lib/api";

type Tab = 'users' | 'keys' | 'billing';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('bexo_access_token'));
  const [activeTab, setActiveTab] = useState<Tab>('users');
  
  // Auth state
  const [authPhone, setAuthPhone] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authPhase, setAuthPhase] = useState<'phone' | 'otp'>('phone');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard / Users list state
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [metrics, setMetrics] = useState({
    totalStorageUsedBytes: 0,
    totalUsersOverall: 0,
    totalRevenueOverall: 0,
    activeAnnualSubscriptions: 0,
    activeLifetimeSubscriptions: 0,
    computedMrr: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Impersonate state
  const [impersonationResult, setImpersonationResult] = useState<{ token: string; name: string } | null>(null);

  // Refund state
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [refundMessage, setRefundMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Key gen state
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [keyCount, setKeyCount] = useState(5);
  const [generatedBatch, setGeneratedBatch] = useState<{ batchId: string; keys: string[] } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(p => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load dashboard / search data
  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await client.adminSearchUsers(debouncedSearch, pagination.page, pagination.limit);
      setUsers(data.users);
      setPagination(data.pagination);
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.message || 'Failed to load user records.');
      if (err.message.includes('401') || err.message.includes('403')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [debouncedSearch, pagination.page, token]);

  // Load organizations for key gen tab
  const loadOrganizations = async () => {
    if (!token || activeTab !== 'keys') return;
    try {
      const list = await client.adminListOrganizations();
      setOrgs(list);
      if (list.length > 0) {
        setSelectedOrgId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load organizations', err);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [activeTab, token]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      await client.sendOtp(authPhone);
      setAuthPhase('otp');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await client.verifyOtp(authPhone, authOtp);
      
      // Setup access token in client and state
      setAccessToken(res.accessToken);
      setToken(res.accessToken);
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAccessToken(undefined);
    setToken(null);
    setAuthPhase('phone');
    setAuthPhone('');
    setAuthOtp('');
  };

  const handleImpersonate = async (userId: string, name: string) => {
    setImpersonationResult(null);
    try {
      const res = await client.adminImpersonate(userId);
      setImpersonationResult({
        token: res.token,
        name: name || 'User',
      });
    } catch (err: any) {
      alert(`Impersonation failed: ${err.message}`);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPaymentId.trim()) return;
    setRefunding(true);
    setRefundMessage(null);
    try {
      await client.adminRefund(refundPaymentId);
      setRefundMessage({ type: 'success', text: 'Payment refunded and subscription revoked successfully!' });
      setRefundPaymentId('');
      loadDashboard();
    } catch (err: any) {
      setRefundMessage({ type: 'error', text: err.message || 'Failed to process refund.' });
    } finally {
      setRefunding(false);
    }
  };

  const handleGenerateKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;
    setGenerating(true);
    setGenError('');
    setGeneratedBatch(null);
    try {
      const res = await client.adminGenerateKeys(selectedOrgId, keyCount);
      setGeneratedBatch(res);
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate key batch.');
    } finally {
      setGenerating(false);
    }
  };

  // If not authenticated, render Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 rounded-xl bg-pink-600 items-center justify-center font-bold text-white text-2xl shadow-sm mb-4">
              B
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in with your configured administrator mobile number.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 font-medium rounded">
              {authError}
            </div>
          )}

          {authPhase === 'phone' ? (
            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Mobile Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={authPhone}
                  onChange={e => setAuthPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={authLoading || !authPhone.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {authLoading ? 'Sending...' : 'Send Verification OTP'}
              </Button>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                  Enter 6-Digit OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={authOtp}
                  onChange={e => setAuthOtp(e.target.value)}
                  placeholder="123456"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-center tracking-widest text-lg font-bold"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={authLoading || authOtp.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setAuthPhase('phone')}
                  className="text-xs text-pink-600 hover:text-pink-700 font-medium text-center"
                >
                  ← Change phone number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
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
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-600 transition"
          >
            Logout
          </button>
          <div className="h-8 w-8 rounded-full bg-pink-600 flex items-center justify-center font-bold text-white">
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
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>Users & Profiles</span>
              </button>
              <button
                onClick={() => setActiveTab('keys')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'keys'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>Key Generation</span>
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === 'billing'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>Refund Panel</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-8 space-y-8 max-w-5xl overflow-y-auto">
          {activeTab === 'users' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Profiles</h1>
                  <p className="text-sm text-gray-500 mt-1">Review, activate, and moderate all active BEXO accounts.</p>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 font-semibold uppercase">Total Users Overall</div>
                  <div className="text-3xl font-extrabold text-gray-900 mt-2">
                    {metrics.totalUsersOverall.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 font-semibold uppercase">Total Active Subscriptions</div>
                  <div className="text-3xl font-extrabold text-gray-900 mt-2">
                    {(metrics.activeAnnualSubscriptions + metrics.activeLifetimeSubscriptions).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">
                    {metrics.activeAnnualSubscriptions} Annual | {metrics.activeLifetimeSubscriptions} Lifetime
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500 font-semibold uppercase">Total Revenue / Est MRR</div>
                  <div className="text-3xl font-extrabold text-gray-900 mt-2">
                    ₹{metrics.totalRevenueOverall.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Est. Monthly MRR: ₹{metrics.computedMrr.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Impersonation Results Banner */}
              {impersonationResult && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 space-y-3">
                  <h3 className="font-bold text-pink-900">Impersonation Token Generated</h3>
                  <p className="text-sm text-pink-700">
                    You have generated a secure session for user <strong className="font-semibold">{impersonationResult.name}</strong>.
                    Copy the token or click the button below to open their onboarding portal.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={impersonationResult.token}
                      className="bg-white border border-pink-300 rounded px-3 py-1.5 text-xs font-mono text-gray-800 flex-1"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      variant="primary"
                      onClick={() => {
                        window.open(`http://localhost:5173/?token=${impersonationResult.token}`, '_blank');
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs py-1.5"
                    >
                      Launch Portal
                    </Button>
                    <Button
                      onClick={() => setImpersonationResult(null)}
                      className="border border-pink-300 text-pink-700 hover:bg-pink-100 text-xs py-1.5"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 font-medium rounded-xl">
                  {error}
                </div>
              )}

              {/* Table Container */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <span className="font-bold text-gray-900 text-sm">Active Accounts</span>
                  
                  {/* Search box */}
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-gray-400">
                    <ActivityIndicator />
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-12 text-center text-sm text-gray-400">
                    No users found matching search query.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-3">User Details</th>
                          <th className="px-6 py-3">Phone</th>
                          <th className="px-6 py-3">Storage footprint</th>
                          <th className="px-6 py-3">Created</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((u) => {
                          const storageMb = (u.storage_used_bytes / 1024 / 1024).toFixed(2);
                          const quotaMb = (u.storage_quota_bytes / 1024 / 1024).toFixed(0);
                          return (
                            <tr key={u.id}>
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">{u.name || 'Anonymous'}</div>
                                <div className="text-gray-400 text-[11px]">{u.email || 'No email set'}</div>
                              </td>
                              <td className="px-6 py-4 font-mono">{u.phone}</td>
                              <td className="px-6 py-4">
                                <div>{storageMb} MB / {quotaMb} MB</div>
                                <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className="bg-indigo-600 h-full"
                                    style={{ width: `${Math.min(100, (u.storage_used_bytes / u.storage_quota_bytes) * 100)}%` }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleImpersonate(u.id, u.name)}
                                  className="text-pink-600 hover:text-pink-900 font-semibold"
                                >
                                  Impersonate
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                        className="py-1 px-3 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                        className="py-1 px-3 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Key Generation</h1>
                <p className="text-sm text-gray-500 mt-1">Generate a batch of 90-day validity activation codes for enterprise/partner colleges.</p>
              </div>

              {genError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 font-medium rounded">
                  {genError}
                </div>
              )}

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
                <form onSubmit={handleGenerateKeys} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Select Partner Organization</label>
                    <select
                      value={selectedOrgId}
                      onChange={e => setSelectedOrgId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      {orgs.length === 0 ? (
                        <option value="">No organizations available</option>
                      ) : (
                        orgs.map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.plan_type})</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Number of keys to generate</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={keyCount}
                      onChange={e => setKeyCount(parseInt(e.target.value, 10))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={generating || !selectedOrgId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {generating ? 'Generating Batch...' : 'Generate Batch'}
                  </Button>
                </form>
              </div>

              {generatedBatch && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl space-y-4">
                  <h3 className="font-bold text-gray-900">Generated Activation Keys</h3>
                  <p className="text-xs text-gray-500">Batch ID: <span className="font-mono">{generatedBatch.batchId}</span></p>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-60 overflow-y-auto space-y-2">
                    {generatedBatch.keys.map((k, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-mono">
                        <span>{k}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(k);
                            alert('Copied to clipboard!');
                          }}
                          className="text-indigo-600 hover:underline text-[11px]"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => {
                      const allKeysText = generatedBatch.keys.join('\n');
                      navigator.clipboard.writeText(allKeysText);
                      alert('All keys copied to clipboard!');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2"
                  >
                    Copy All Keys
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing Refund Panel</h1>
                <p className="text-sm text-gray-500 mt-1">Refund user payments and revoke active premium plans by transaction ID.</p>
              </div>

              {refundMessage && (
                <div className={`p-4 text-sm font-medium rounded border ${
                  refundMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {refundMessage.text}
                </div>
              )}

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
                <form onSubmit={handleRefund} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Payment ID (UUID)</label>
                    <input
                      type="text"
                      required
                      value={refundPaymentId}
                      onChange={e => setRefundPaymentId(e.target.value)}
                      placeholder="e.g. 6b9f903d-9fef-46a7-9429-7e29f70229f2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm font-mono"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={refunding || !refundPaymentId.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {refunding ? 'Processing Refund...' : 'Process Refund & Revoke Plan'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Simple internal helper for loader
function ActivityIndicator() {
  return (
    <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  );
}
