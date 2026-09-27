import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Leaf,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Database,
  ExternalLink,
  ChevronDown,
  Check,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import {
  getSupabaseConfig,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection
} from '../../services/supabaseClient';
import { NotificationItem, UserRole } from '../../types';

interface NavbarProps {
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAI }) => {
  const { user, role, logout, switchUserRole, isSupabaseLive, refreshSupabaseStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // Supabase modal state
  const config = getSupabaseConfig();
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const loadNotifs = async () => {
      if (user) {
        const list = await dataService.getNotifications(user.id);
        setNotifications(list);
      }
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.read) await dataService.markNotificationAsRead(n.id);
    }
    if (user) {
      const updated = await dataService.getNotifications(user.id);
      setNotifications(updated);
    }
  };

  const handleRoleSwitch = async (newRole: UserRole) => {
    setShowUserMenu(false);
    await switchUserRole(newRole);
    if (newRole === 'kitchen') navigate('/kitchen/dashboard');
    else if (newRole === 'fpu') navigate('/fpu/dashboard');
    else if (newRole === 'ngo') navigate('/ngo/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  const getDashboardPath = () => {
    if (!role) return '/login';
    if (role === 'kitchen') return '/kitchen/dashboard';
    if (role === 'fpu') return '/fpu/dashboard';
    if (role === 'ngo') return '/ngo/dashboard';
    return '/admin/dashboard';
  };

  const handleTestSaveSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await setCustomSupabaseConfig(inputUrl, inputKey);
    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: 'Successfully connected and saved Supabase credentials! Active cloud sync enabled.'
      });
      await refreshSupabaseStatus();
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Connection verification failed. Please verify Project URL and Anon key.'
      });
    }
  };

  const handleResetToEnv = () => {
    clearCustomSupabaseConfig();
    const updated = getSupabaseConfig();
    setInputUrl(updated.url || '');
    setInputKey('');
    setTestResult({
      success: true,
      message: 'Reset to environment variables / local store mode.'
    });
    refreshSupabaseStatus();
  };

  const handleSyncSeedToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await dataService.syncSeedDataToSupabase();
      setSyncResult({
        success: res.success,
        message: res.message + (res.count ? ` (${res.count} records processed)` : '')
      });
    } catch (e: any) {
      setSyncResult({
        success: false,
        message: e.message || 'Error executing seed sync.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const copyMigrationPath = () => {
    navigator.clipboard.writeText('supabase/migrations/20260927_init_ecofeast.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isNavActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Logo & Public Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Eco<span className="text-emerald-600">Feast</span>
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500 font-normal">
                    · Food Surplus Recovery
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isNavActive('/') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/impact"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isNavActive('/impact') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Impact Metrics
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isNavActive('/about') ? 'text-emerald-700 bg-emerald-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  About Platform
                </Link>
                {user && (
                  <Link
                    to={getDashboardPath()}
                    className={`ml-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      location.pathname.startsWith('/kitchen') ||
                      location.pathname.startsWith('/ngo') ||
                      location.pathname.startsWith('/fpu') ||
                      location.pathname.startsWith('/admin')
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    Console ({role?.toUpperCase()})
                  </Link>
                )}
              </nav>
            </div>

            {/* Right: Actions & User Controls */}
            <div className="flex items-center gap-2.5">
              
              {/* Database / Supabase Status Pill */}
              <button
                onClick={() => setShowDbModal(true)}
                title="Click to view database connection status & configuration"
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSupabaseLive
                    ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/70'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>{isSupabaseLive ? 'Supabase Live' : 'Database: Local Store'}</span>
              </button>

              {/* AI Assistant Button */}
              <button
                onClick={onOpenAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">EcoFeast</span> AI
              </button>

              {user ? (
                <>
                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowUserMenu(false);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative transition-colors cursor-pointer"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white"></span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                              Notifications
                            </span>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {unreadCount} unread
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500">
                              No notifications right now.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`p-3.5 hover:bg-slate-50 transition-colors ${
                                  !notif.read ? 'bg-emerald-50/30' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                    {new Date(notif.created_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowUserMenu(!showUserMenu);
                        setShowNotifications(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        {user.organization_name.charAt(0)}
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                          {user.full_name}
                        </p>
                        <p className="text-[10px] text-slate-500 capitalize">{role}</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.organization_name}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Role: {role}
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to={getDashboardPath()}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Go to Dashboard</span>
                          </Link>
                        </div>

                        {/* Quick Role Switcher for Hackathon Demonstrations */}
                        <div className="py-1 border-t border-slate-100 px-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 py-1">
                            Switch Role (Demo)
                          </p>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            {(['kitchen', 'fpu', 'ngo', 'admin'] as UserRole[]).map((r) => (
                              <button
                                key={r}
                                onClick={() => handleRoleSwitch(r)}
                                className={`text-[11px] font-medium py-1 px-2 rounded-md text-left capitalize cursor-pointer ${
                                  role === r
                                    ? 'bg-emerald-600 text-white font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={async () => {
                              setShowUserMenu(false);
                              await logout();
                              navigate('/login');
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Overview
              </Link>
              <Link
                to="/impact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Impact Metrics
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                About Platform
              </Link>
              {user && (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg"
                >
                  My Console ({role?.toUpperCase()})
                </Link>
              )}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDbModal(true);
                }}
                className="text-xs font-medium text-slate-600 flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isSupabaseLive ? 'Supabase Live' : 'Database: Local Store'}</span>
              </button>
              {user && (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="text-xs font-medium text-rose-600 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Supabase Database Setup & Status Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Supabase Database Connection</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your live Supabase project or view current configuration.
                </p>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current State Info */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isSupabaseLive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div>
                  <p className="text-xs font-bold">
                    {isSupabaseLive ? 'Connected to Supabase PostgreSQL' : 'Using Local Storage Store'}
                  </p>
                  <p className="text-[11px] opacity-80 font-mono">
                    {config.url || 'No cloud URL active (fallback store enabled)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Credentials Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Project URL</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Public Anon Key</label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-900"
                />
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            {syncResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  syncResult.success
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {syncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{syncResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={handleTestSaveSupabase}
                disabled={isTesting}
                className="w-full sm:flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isTesting ? 'Verifying...' : 'Save & Connect'}</span>
              </button>

              {isSupabaseLive && (
                <button
                  onClick={handleSyncSeedToSupabase}
                  disabled={isSyncing}
                  className="w-full sm:w-auto py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Seed Data</span>
                </button>
              )}

              <button
                onClick={handleResetToEnv}
                className="w-full sm:w-auto py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Migration File Note */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono truncate">Migration: 20260927_init_ecofeast.sql</span>
              <button
                onClick={copyMigrationPath}
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy Path'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
