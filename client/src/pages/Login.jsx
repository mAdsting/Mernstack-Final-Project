import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff, UserCircle } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'landlord') {
        navigate('/');
      } else if (user.role === 'agent') {
        navigate('/agent-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <UserCircle size={64} className="text-indigo-500 mb-2" />
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Sign in to your account</h2>
        {error && <div className="mb-4 text-red-600 text-center font-medium bg-red-50 rounded p-2 w-full">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="relative">
            <input
              type="email"
              id="email"
              className="peer block w-full rounded-md border border-gray-300 bg-transparent px-4 pt-6 pb-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-label="Email"
            />
            <label htmlFor="email" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm pointer-events-none">Email</label>
            <Mail size={18} className="absolute right-3 top-3 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="peer block w-full rounded-md border border-gray-300 bg-transparent px-4 pt-6 pb-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-label="Password"
            />
            <label htmlFor="password" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm pointer-events-none">Password</label>
            <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600 focus:outline-none" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition font-semibold flex items-center justify-center gap-2"
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <span className="animate-spin mr-2"><svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></span>}
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 