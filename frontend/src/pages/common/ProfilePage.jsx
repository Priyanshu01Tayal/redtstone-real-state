import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, Save, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone, bio });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">Profile Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your account details and contact information</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEEEEE] shadow-sm">
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold">
            Profile updated successfully!
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C62828]"
          />
          <div>
            <h3 className="font-bold text-base text-[#222222]">{user?.name}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#FFEBEE] text-[#C62828]">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address (Registered)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Bio / Profile Summary</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
