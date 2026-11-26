import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Home, Compass } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const isAdminRequested = requestedRole === 'admin';
  const initialRole = isAdminRequested || !['client', 'owner', 'broker'].includes(requestedRole) ? 'client' : requestedRole;

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'admin') {
      setError('Admin accounts cannot be registered publicly.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const user = await register({
        name,
        email,
        phone,
        password,
        role,
        licenseNumber: role === 'broker' ? licenseNumber : '',
        experienceYears: role === 'broker' ? Number(experienceYears) : 0,
      });

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/welcome" className="inline-flex items-center space-x-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#222222]">
              RED<span className="text-[#C62828]">STONE</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-[#222222]">Create an Account</h2>
          <p className="text-xs text-gray-500 mt-1">Select your stakeholder profile to get started</p>
        </div>

        {/* Admin Registration Warning */}
        {isAdminRequested && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
            <p className="font-bold">⚠️ Admin Registration Disabled</p>
            <p>
              Administrative accounts cannot be registered publicly. If you are an authorized administrator, please{' '}
              <Link to="/login?role=admin" className="font-black text-[#C62828] underline">
                Sign In to Admin Portal
              </Link>.
            </p>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'client'
                ? 'bg-white text-[#C62828] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Buyer / Client</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'owner'
                ? 'bg-white text-[#C62828] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Property Owner</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('broker')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'broker'
                ? 'bg-white text-[#C62828] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Broker Team</span>
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-white p-8 rounded-3xl border border-[#EEEEEE] shadow-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C62828] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98110 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            {/* Broker-specific fields */}
            {role === 'broker' && (
              <div className="p-3.5 bg-[#FFEBEE]/40 border border-red-200 rounded-2xl space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">RERA License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-REA-2023-XXXX"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Years of Real Estate Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <span>{submitting ? 'Creating Account...' : `Register as ${role.toUpperCase()}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="text-[#C62828] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
