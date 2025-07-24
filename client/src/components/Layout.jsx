import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  Wallet,
  Bell,
  Menu,
  X,
  CreditCard,
  BarChart2,
  DollarSign,
  LifeBuoy,
  Settings,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'My Properties', icon: Home },
  { to: '/houses', label: 'Houses/Flats', icon: Home },
  { to: '/tenants', label: 'Tenants', icon: Users },
];

function TopBar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-b-lg mb-6 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold text-indigo-700 tracking-tight">Dashboard</span>
      </div>
      <div className="flex items-center space-x-4 relative">
        {user && (
          <button
            className="flex items-center gap-2 text-sm text-gray-700 focus:outline-none"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </span>
            <span className="hidden md:inline font-medium">{user.email}</span>
          </button>
        )}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
            >Profile/Settings</button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              onClick={handleLogout}
            >Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();
  const navLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: '/dashboard' },
    { label: 'Properties', icon: <Home size={20} />, to: '/properties' },
    { label: 'Tenants', icon: <Users size={20} />, to: '/tenants' },
    { label: 'Invoices', icon: <CreditCard size={20} />, to: '/invoices' },
    { label: 'Payments', icon: <Wallet size={20} />, to: '/payments' },
    { label: 'Analytics & Reports', icon: <BarChart2 size={20} />, to: '/analytics' },
    { label: 'Notifications', icon: <Bell size={20} />, to: '/notifications' },
    { label: 'Calendar / Events', icon: <Menu size={20} />, to: '/calendar' },
  ];
  const bottomLinks = [
    { label: 'Support', icon: <LifeBuoy size={20} />, to: '/support' },
    { label: 'Settings', icon: <Settings size={20} />, to: '/settings' },
    { label: 'Logout', icon: <X size={20} />, to: '/logout', onClick: () => { localStorage.clear(); window.location.href = '/login'; } },
  ];
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl z-40">
      <div className="flex items-center justify-center py-8 border-b border-slate-700">
        <Home size={32} className="text-slate-300 mr-2" />
        <span className="text-2xl font-bold tracking-tight">LandlordPay</span>
      </div>
      <nav className="flex-1 flex flex-col gap-2 mt-8 px-4">
        {navLinks.map(link => (
          <Link
            key={link.label}
            to={link.to}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 hover:text-white transition font-medium ${location.pathname === link.to ? 'bg-slate-700' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-2 px-4 mb-4 mt-auto">
        {bottomLinks.map(link => (
          link.to === '/logout' ? (
            <button
              key={link.label}
              onClick={link.onClick}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 hover:text-white transition font-medium"
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ) : (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 hover:text-white transition font-medium ${location.pathname === link.to ? 'bg-slate-700' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          )
        ))}
      </div>
      <div className="py-4 px-6 text-xs text-slate-200 opacity-70">&copy; {new Date().getFullYear()} LandlordPay</div>
    </aside>
  );
}

function Layout() {
  // Auto-logout after 5 minutes of inactivity
  const logoutTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function logout() {
      localStorage.clear();
      window.location.href = '/login';
    }
    function resetTimer() {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      logoutTimer.current = setTimeout(logout, 5 * 60 * 1000); // 5 minutes
    }
    // List of events that indicate activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer on mount
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60">
        <TopBar />
        <main className="flex-1 px-0 md:px-0 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout; 