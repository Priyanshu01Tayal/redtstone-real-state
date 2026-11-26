import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, Key } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect');
  const roleParam = searchParams.get('role');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(`/${user.role}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
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
          <h2 className="text-2xl font-black text-[#222222]">Welcome Back</h2>
          <p className="text-xs text-gray-500 mt-1">Sign in to your role-based dashboard</p>
          {roleParam && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-bold mt-2 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              <span className="capitalize">{roleParam} Portal</span>
              <span className="text-gray-400">•</span>
              <Link to="/welcome" className="underline hover:text-red-950 font-normal">
                Change Role
              </Link>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-[#EEEEEE] shadow-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C62828] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {roleParam !== 'admin' ? (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
              Don't have an account yet?{' '}
              <Link
                to={roleParam ? `/register?role=${roleParam}` : '/register'}
                className="text-[#C62828] font-bold hover:underline"
              >
                Create an account
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
              Administrative portal access is restricted to authorized personnel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
