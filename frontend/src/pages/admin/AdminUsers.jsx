import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Shield, CheckCircle, XCircle, Search } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (window.confirm(`Are you sure you want to change user status to ${newStatus}?`)) {
      try {
        await api.put(`/admin/users/${id}/status`, { status: newStatus });
        fetchUsers();
      } catch (err) {
        alert('Failed to update status');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">User Directory & Access Control</h1>
        <p className="text-xs text-gray-500 mt-1">Manage Property Owners, In-House Brokers, and Clients.</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto font-bold">
          {['', 'owner', 'broker', 'client', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl uppercase transition ${
                roleFilter === r ? 'bg-[#C62828] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="w-full sm:w-64 relative"
        >
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
          />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading user list...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No users match filter.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u._id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs hover:bg-gray-50/50 transition">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#222222] text-sm">{u.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#FFEBEE] text-[#C62828]">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{u.email} • {u.phone}</p>
                    {u.role === 'broker' && (
                      <p className="text-[10px] text-gray-400">
                        License: {u.licenseNumber || 'Verified'} • {u.experienceYears} yrs exp
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.status || 'active'}
                  </span>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        u.status === 'active'
                          ? 'border border-red-200 text-red-600 hover:bg-red-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
