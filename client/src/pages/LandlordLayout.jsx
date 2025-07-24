import React from 'react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'properties', label: 'My Properties' },
  { key: 'houses', label: 'Houses/Flats' },
  { key: 'payments', label: 'Payments' },
  { key: 'logout', label: 'Logout' },
];

function LandlordLayout({ selected, onSelect, children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-indigo-700 text-white flex flex-col py-8 px-4">
        <div className="text-2xl font-bold mb-10 text-center">Landlord Panel</div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`w-full text-left px-4 py-2 rounded transition font-medium ${selected === item.key ? 'bg-indigo-900' : 'hover:bg-indigo-800'}`}
              onClick={() => onSelect(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

export default LandlordLayout; 