import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogIn, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, role: currentRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectByRole = (userRole: UserRole) => {
    switch (userRole) {
      case 'kitchen':
        navigate('/kitchen/dashboard');
        break;
      case 'fpu':
        navigate('/fpu/dashboard');
        break;
      case 'ngo':
        navigate('/ngo/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.role) {
        redirectByRole(res.role);
        return;
      }
      const stored = localStorage.getItem('ecofeast_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        redirectByRole(u.role);
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, roleHint: UserRole) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setIsSubmitting(true);
    setError(null);
    const res = await login(demoEmail, 'demo123');
    setIsSubmitting(false);
    if (res.success) {
      redirectByRole(roleHint);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Eco<span className="text-emerald-600">Feast</span>
          </span>
        </Link>
        <h2 className="text-center text-xl font-bold text-slate-900">
          Sign In to Your Organization Console
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Access food surplus recovery, safety verification, and smart dispatch
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>SIH Hackathon Quick Logins:</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              One-click access with pre-configured realistic operational accounts:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('kitchen@ecofeast.org', 'kitchen')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl transition-all"
              >
                <p className="text-xs font-bold text-slate-900">DTU Mega Mess</p>
                <p className="text-[10px] text-emerald-700 font-semibold uppercase">Kitchen Role</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ngo@ecofeast.org', 'ngo')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl transition-all"
              >
                <p className="text-xs font-bold text-slate-900">Robin Hood Army</p>
                <p className="text-[10px] text-blue-700 font-semibold uppercase">NGO Role</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('fpu@ecofeast.org', 'fpu')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 rounded-xl transition-all"
              >
                <p className="text-xs font-bold text-slate-900">GreenHarvest Agro</p>
                <p className="text-[10px] text-amber-700 font-semibold uppercase">FPU Role</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@ecofeast.org', 'admin')}
                className="p-2 text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl transition-all"
              >
                <p className="text-xs font-bold text-slate-900">Dr. Priya Varma</p>
                <p className="text-[10px] text-purple-700 font-semibold uppercase">Admin Role</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an organization account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Register now
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
