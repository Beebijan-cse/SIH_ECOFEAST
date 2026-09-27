import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  Zap,
  Truck,
  Clock,
  Activity,
  Leaf,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronRight,
  LogOut,
  User,
  Database,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { AIAssistantModal } from '../ai/AIAssistantModal';
import {
  getSupabaseConfig,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig
} from '../../services/supabaseClient';
import { NotificationItem, UserRole } from '../../types';

export const DashboardLayout: React.FC = () => {
  const { user, role, switchUserRole, logout, isSupabaseLive, refreshSupabaseStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Supabase credentials modal state
  const config = getSupabaseConfig();
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load real user notifications
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
    setUserMenuOpen(false);
    setSettingsOpen(false);
    await switchUserRole(newRole);
    if (newRole === 'kitchen') navigate('/kitchen/dashboard');
    else if (newRole === 'fpu') navigate('/fpu/dashboard');
    else if (newRole === 'ngo') navigate('/ngo/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  const handleTestSaveSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await setCustomSupabaseConfig(inputUrl, inputKey);
    setIsTesting(false);
    if (res.success) {
      setTestResult({
        success: true,
        message: 'Successfully connected and verified Supabase credentials!'
      });
      await refreshSupabaseStatus();
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Connection failed. Please verify URL and key.'
      });
    }
  };

  // Section 9: Specific sidebar items:
  // EcoFeast logo, Dashboard, Surplus, Safety, Matching, Pickups, Traceability, Digital Twin, Impact, Notifications, Settings
  const getNavItems = () => {
    const rolePrefix = role === 'admin' ? '/admin' : role === 'fpu' ? '/fpu' : role === 'ngo' ? '/ngo' : '/kitchen';

    // Route target resolving based on active role
    const surplusTarget = role === 'kitchen' ? '/kitchen/surplus' : role === 'fpu' ? '/fpu/surplus' : role === 'ngo' ? '/ngo/available' : '/admin/listings';
    const pickupsTarget = role === 'ngo' ? '/ngo/pickups' : role === 'admin' ? '/admin/pickups' : '/ngo/pickups';
    const matchingTarget = role === 'admin' ? '/admin/matches' : '/kitchen/matching';

    return [
      { to: `${rolePrefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { to: surplusTarget, label: 'Surplus', icon: Package },
      { to: '/kitchen/safety', label: 'Safety', icon: ShieldCheck },
      { to: matchingTarget, label: 'Matching', icon: Zap },
      { to: pickupsTarget, label: 'Pickups', icon: Truck },
      { to: '/kitchen/traceability', label: 'Traceability', icon: Clock },
      { to: '/kitchen/digital-twin', label: 'Digital Twin', icon: Activity },
      { to: '/impact', label: 'Impact', icon: Leaf },
    ];
  };

  const navItems = getNavItems();

  // Find active label for breadcrumb
  const currentItem = navItems.find((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'));
  const pageTitle = currentItem?.label || (location.pathname.includes('/surplus/create') ? 'Create Surplus' : 'Overview');

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-emerald-500 selection:text-white">
      
      {/* ================================================== */}
      {/* 9. SIDEBAR (Desktop) */}
      {/* ================================================== */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200/80 flex-col justify-between h-screen sticky top-0 z-30">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          
          {/* EcoFeast Logo Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
                  EcoFeast
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
                  Sustainability Platform
                </span>
              </div>
            </Link>
          </div>

          {/* User & Role Badge */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.organization_name?.charAt(0) || 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.organization_name || 'Organization'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                    {role} console
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Main Menu
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'));
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
                </NavLink>
              );
            })}

            {/* Quick Actions in Sidebar: Notifications & Settings */}
            <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Preferences
              </p>

              <button
                onClick={() => setNotificationsOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: EcoFeast AI Launcher */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => setAiModalOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer text-left group shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">EcoFeast AI</p>
                <p className="text-[10px] text-slate-400">Safety & logistics guide</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </aside>

      {/* ================================================== */}
      {/* MOBILE RESPONSIVE SIDEBAR MENU */}
      {/* ================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-white flex flex-col justify-between shadow-xl z-10 h-full p-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-slate-900">EcoFeast</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block uppercase">
                      {role} Console
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span>{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setNotificationsOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* MAIN CONTENT AREA WITH TOP NAVIGATION (Section 10) */}
      {/* ================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 10. TOP NAVIGATION */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
                <span>/</span>
                <span className="capitalize text-slate-600">{role} Console</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{pageTitle}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right: Search, Notifications, AI Assistant, User Avatar & Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search console..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* AI Assistant Quick Button */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer"
              title="Ask EcoFeast AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Assistant</span>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="py-2.5 px-1 flex items-start gap-2.5">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">{role}</p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.full_name || 'User Profile'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@ecofeast.org'}</p>
                  </div>

                  <div className="px-2 py-1.5">
                    <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Switch Role View
                    </span>
                    {(['kitchen', 'ngo', 'fpu', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleSwitch(r)}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between capitalize cursor-pointer transition-colors ${
                          role === r ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{r} Console</span>
                        {role === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1.5 px-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Console Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ================================================== */}
      {/* CONSOLE SETTINGS MODAL */}
      {/* ================================================== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Console Settings</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Organization Profile
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold text-slate-900">{user?.organization_name || 'EcoFeast Partner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role:</span>
                  <span className="font-semibold text-emerald-700 capitalize">{role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Email:</span>
                  <span className="font-semibold text-slate-900">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Supabase Database Connection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Database & Cloud Sync
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isSupabaseLive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {isSupabaseLive ? 'Supabase Live' : 'Local Storage Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Data persists automatically. You can connect your custom Supabase project at any time.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    setDbModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configure Supabase</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Custom Config Modal */}
      {dbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Supabase Cloud Sync</h3>
              </div>
              <button
                onClick={() => setDbModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your public Supabase URL and Anon Key. Keys are stored locally and are never transmitted to unauthorized services.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anon Public Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs ${testResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {testResult.message}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDbModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTestSaveSupabase}
                disabled={isTesting}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                {isTesting ? 'Testing...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
};
