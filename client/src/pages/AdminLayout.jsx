import React from 'react';
import { UserCircle, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'logout', label: 'Logout', icon: LogOut },
];

function AdminLayout({ selected, onSelect, children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-200">
      {/* Sidebar */}
      <aside className="w-60 bg-indigo-700 text-white flex flex-col py-8 px-4 shadow-2xl sticky top-0 h-screen z-30">
        <div className="flex flex-col items-center mb-10">
          <UserCircle size={48} className="text-indigo-200 mb-2" />
          <div className="text-lg font-bold">Admin Panel</div>
          {user && <div className="text-xs text-indigo-100 mt-1">{user.email}</div>}
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition font-medium outline-none focus:ring-2 focus:ring-white ${selected === item.key ? 'bg-indigo-900 shadow' : 'hover:bg-indigo-800 focus:bg-indigo-800'}`}
                onClick={() => onSelect(item.key)}
                aria-current={selected === item.key ? 'page' : undefined}
                tabIndex={0}
              >
                <Icon size={20} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 bg-white rounded-l-3xl shadow-xl min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout; 