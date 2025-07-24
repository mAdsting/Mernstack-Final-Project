import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { UserPlus, Users } from 'lucide-react';
import { getAuthHeaders } from '../services/api';

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('landlord');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);

  // Fetch users on mount or when switching to Users tab
  useEffect(() => {
    if (selected !== 'users') return;
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/users', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError('Could not load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error creating user');
      setMessage(`User ${email} (${role}) created successfully!`);
      setEmail('');
      setPassword('');
      setRole('landlord');
      setShowModal(false);
      // Refresh user list
      setUsers((prev) => [...prev, { email, role, createdAt: new Date().toISOString() }]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  let content;
  if (selected === 'dashboard') {
    content = (
      <div>
        <div className="text-2xl font-bold mb-4">Welcome, Admin!</div>
        <div className="text-gray-600">Select a section from the left panel to manage the system.</div>
      </div>
    );
  } else if (selected === 'users') {
    content = (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">User Management</h2>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={20} />Landlords & Agents</h3>
          <button
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition flex items-center gap-2"
            onClick={() => { setShowModal(true); setMessage(''); setError(''); }}
          >
            <UserPlus size={18} /> Add User
          </button>
        </div>
        {message && <div className="mb-2 text-green-600 text-center font-medium bg-green-50 rounded p-2">{message}</div>}
        {error && <div className="mb-2 text-red-600 text-center font-medium bg-red-50 rounded p-2">{error}</div>}
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-xl bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.email + idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal for Add User */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-700"><UserPlus size={20} />Create Landlord/Agent Account</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className="peer block w-full rounded-md border border-gray-300 bg-transparent px-4 pt-6 pb-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    aria-label="Password"
                  />
                  <label htmlFor="password" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm pointer-events-none">Password</label>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="landlord">Landlord</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition font-semibold flex items-center justify-center gap-2"
                >
                  Create User
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  } else if (selected === 'logout') {
    handleLogout();
    return null;
  }

  return (
    <AdminLayout selected={selected} onSelect={setSelected}>
      {/* Show logged in user info at the top of main content */}
      <div className="mb-6 text-right text-sm text-gray-600">
        Logged in as: <span className="font-semibold">{user?.email}</span> ({user?.role})
      </div>
      {content}
    </AdminLayout>
  );
}

export default AdminDashboard; 