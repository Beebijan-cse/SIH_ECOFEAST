import React, { useState, useEffect } from 'react';
import { Users, Search, Building2, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Profile } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    dataService.getProfiles().then(setProfiles);
  }, []);

  const filtered = profiles.filter((p) => {
    if (roleFilter !== 'all' && p.role !== roleFilter) return false;
    if (
      searchTerm &&
      !p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-900">User & Organization Directory</h1>
        </div>
        <p className="text-xs text-slate-500">
          Supervise accredited institutional kitchens, processing facilities, and verified NGO food rescue coordinators.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by contact name or organization..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 w-full sm:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="kitchen">Kitchens</option>
          <option value="fpu">Food Processing Units</option>
          <option value="ngo">NGOs</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Organization & Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{p.organization_name}</p>
                    <p className="text-[11px] text-slate-500">{p.full_name}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        p.role === 'kitchen'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.role === 'ngo'
                          ? 'bg-blue-100 text-blue-800'
                          : p.role === 'fpu'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.location}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {p.email}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {p.phone || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
