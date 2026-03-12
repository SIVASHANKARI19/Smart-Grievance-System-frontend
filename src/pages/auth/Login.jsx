import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { decodeToken } from '../../utils/decodeToken';


const Shape = ({ className }) => (
  <div className={`absolute rounded-2xl opacity-60 ${className}`} />
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      if (data.token) {
        login(data.token);
        const decoded = decodeToken(data.token);
        if (decoded?.role === 'admin') navigate('/admin/dashboard');
        else if (decoded?.role === 'officer') navigate('/officer/dashboard');
        else navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (id) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 bg-white
    ${focused === id ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Canva-style floating shapes */}
      <Shape className="w-24 h-24 bg-blue-200 top-8 left-10 rotate-12" />
      <Shape className="w-14 h-14 bg-yellow-200 top-16 right-24 -rotate-12" />
      <Shape className="w-32 h-32 bg-indigo-100 bottom-12 left-20 rotate-45" />
      <Shape className="w-10 h-10 bg-pink-200 top-1/2 right-10 rotate-6" />
      <Shape className="w-20 h-20 bg-green-100 bottom-24 right-32 -rotate-12" />
      <Shape className="w-8 h-8 bg-orange-200 top-1/3 left-1/4 rotate-45" />
      <Shape className="w-16 h-16 bg-blue-100 top-3/4 left-1/3 -rotate-6" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.3,
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-100/60 border border-white/80 p-8 sm:p-10">

       

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
            <input
              type="email" required placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              className={inputClass('email')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-600">Password</label>
              <span className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer hover:underline transition-colors">
                Forgot password?
              </span>
            </div>
            <input
              type="password" required placeholder="Enter your password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
              className={inputClass('password')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
              text-white text-sm font-bold tracking-wide
              shadow-lg shadow-blue-200 hover:shadow-blue-300
              focus:outline-none focus:ring-4 focus:ring-blue-100
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Role hint cards */}
        <div className="mt-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Accounts types</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'Citizen', color: 'text-blue-600 bg-blue-50 border-blue-100', dot: 'bg-blue-400' },
              { role: 'Officer', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', dot: 'bg-indigo-400' },
              { role: 'Admin', color: 'text-violet-600 bg-violet-50 border-violet-100', dot: 'bg-violet-400' },
            ].map(({ role, color, dot }) => (
              <div key={role} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold ${color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {role}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in you agree to our{' '}
          <span className="text-blue-500 hover:underline cursor-pointer">Terms of Service</span>{' '}
          and{' '}
          <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;