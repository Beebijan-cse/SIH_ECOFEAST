import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  UtensilsCrossed,
  Factory,
  Truck,
  ArrowRight,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  Lock,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState<UserRole>('kitchen');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !organizationName.trim() || !location.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const res = await register({
      fullName,
      email,
      password: password.trim(),
      phone,
      organizationName,
      role,
      location
    });

    setIsSubmitting(false);

    if (res.success) {
      if (role === 'kitchen') navigate('/kitchen/dashboard');
      else if (role === 'fpu') navigate('/fpu/dashboard');
      else if (role === 'ngo') navigate('/ngo/dashboard');
      else navigate('/');
    } else {
      setError(res.error || 'Failed to complete registration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Eco<span className="text-emerald-600">Feast</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Register Your Organization
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Join the AI-powered surplus recovery and redistribution network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Organization Role *
              </label>
              <div className="grid grid-cols-3 gap-3">
                
                <button
                  type="button"
                  onClick={() => setRole('kitchen')}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
                    role === 'kitchen'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <UtensilsCrossed className="w-5 h-5 mb-1.5 text-emerald-600" />
                  <span className="text-xs font-bold">Kitchen</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Mess, Canteen, Hotel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('fpu')}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
                    role === 'fpu'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-xs ring-1 ring-amber-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Factory className="w-5 h-5 mb-1.5 text-amber-600" />
                  <span className="text-xs font-bold">FPU</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Food Processing Unit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ngo')}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
                    role === 'ngo'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Truck className="w-5 h-5 mb-1.5 text-blue-600" />
                  <span className="text-xs font-bold">NGO</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Food Bank, Shelter</span>
                </button>

              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                * Note: Platform Administrator accounts are provisioned exclusively via administrative invite.
              </p>
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Organization Name *</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Delhi Tech University Mega Mess / Robin Hood Army"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Lead Contact Person *</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Chef / Coordinator Name"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Contact Phone Number *</label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98112 34567"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Work Email Address *</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@organization.org"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Password *</label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Facility Location / City *</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bawana Road, Rohini, New Delhi"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Registering Organization...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered with EcoFeast?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
