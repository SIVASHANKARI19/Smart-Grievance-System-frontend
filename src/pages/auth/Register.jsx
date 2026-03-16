import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const departments = [
  'Water Supply',
  'Electricity',
  'Roads & Infrastructure',
  'Sanitation',
  'Health',
  'Education',
  'Agriculture',
];

const Shape = ({ className }) => (
  <div className={`absolute rounded-2xl opacity-60 ${className}`} />
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [department, setDepartment] = useState('Water Supply');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'officer') payload.department = department;
      await authService.register(payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: 'citizen',
      label: 'Citizen',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      desc: 'Report & track issues',
      active: { card: 'border-blue-400 bg-blue-50 shadow-blue-100 ring-2 ring-blue-400', icon: 'bg-blue-100 text-blue-600', label: 'text-blue-700' },
    },
    {
      value: 'officer',
      label: 'Officer',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      desc: 'Manage dept tasks',
      active: { card: 'border-indigo-400 bg-indigo-50 shadow-indigo-100 ring-2 ring-indigo-400', icon: 'bg-indigo-100 text-indigo-600', label: 'text-indigo-700' },
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      desc: 'Full system control',
      active: { card: 'border-violet-400 bg-violet-50 shadow-violet-100 ring-2 ring-violet-400', icon: 'bg-violet-100 text-violet-600', label: 'text-violet-700' },
    },
  ];

  const inputClass = (id) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 bg-white
    ${focused === id ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Canva-style scattered geometric shapes */}
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

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-100/60 border border-white/80 p-8 sm:p-10">

       

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create a new Account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors">
              Log in
            </Link>
          </p>
        </div>

        {/* Role selector cards */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {roles.map(({ value, label, icon, desc, active }) => {
            const isActive = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer
                  ${isActive ? `${active.card} shadow-md` : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isActive ? active.icon : 'bg-gray-100 text-gray-400'}`}>
                  {icon}
                </div>
                <span className={`text-xs font-bold ${isActive ? active.label : 'text-gray-500'}`}>{label}</span>
                <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{desc}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">Your details</span>
          <div className="flex-1 h-px bg-gray-100" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text" required placeholder="John Doe" value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                className={inputClass('name')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email" required placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                className={inputClass('email')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <input
              type="password" required placeholder="Create a strong password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
              className={inputClass('password')}
            />
          </div>

          {role === 'officer' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  onFocus={() => setFocused('dept')} onBlur={() => setFocused('')}
                  className={`${inputClass('dept')} appearance-none cursor-pointer pr-10`}
                >
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
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
                Creating your account…
              </>
            ) : (
              <>
                Create free account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing up you agree to our{' '}
          <span className="text-blue-500 hover:underline cursor-pointer">Terms of Service</span>{' '}
          and{' '}
          <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Register;