import React, { useState, useEffect } from 'react';
import { getTenants, createTenant, getAuthHeaders } from '../services/api';
import { User, CheckCircle, AlertTriangle, UserX, Info, XCircle, Search, Filter } from 'lucide-react';

function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', house: '', balance: 0 });
  const [editId, setEditId] = useState(null);

  // Add state for property/unit selection and rent
  const [addTenantModal, setAddTenantModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantRent, setTenantRent] = useState('');
  const [tenantMsg, setTenantMsg] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [tenantHouseNumber, setTenantHouseNumber] = useState('');

  // Fetch properties for property dropdown
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    fetch('/api/properties', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  // Update available units when property changes
  useEffect(() => {
    const prop = properties.find(p => p._id === selectedPropertyId);
    if (prop && Array.isArray(prop.units)) {
      // Exclude units already assigned to a tenant
      const assigned = (prop.tenants || []).map(t => t.houseNumber);
      setPropertyUnits(prop.units.filter(u => !assigned.includes(u.label)));
    } else {
      setPropertyUnits([]);
    }
    setSelectedUnit('');
  }, [selectedPropertyId, properties]);

  // When unit changes, auto-fill rent
  useEffect(() => {
    if (!selectedUnit) { setTenantRent(''); return; }
    const unit = propertyUnits.find(u => u.label === selectedUnit);
    setTenantRent(unit ? unit.rent : '');
  }, [selectedUnit, propertyUnits]);

  // Add Tenant handler
  async function handleAddTenant(e) {
    e.preventDefault();
    setTenantError('');
    setTenantMsg('');
    let houseNumber = selectedUnit || tenantHouseNumber;
    if (!selectedPropertyId || !houseNumber || !tenantName || !tenantEmail || !tenantPhone || !tenantRent) {
      setTenantError('All fields are required.');
      return;
    }
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          property: selectedPropertyId,
          name: tenantName,
          email: tenantEmail,
          phone: tenantPhone,
          houseNumber: houseNumber,
          rentAmount: tenantRent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding tenant');
      setTenantMsg('Tenant added successfully!');
      setAddTenantModal(false);
      setSelectedPropertyId('');
      setPropertyUnits([]);
      setSelectedUnit('');
      setTenantName('');
      setTenantEmail('');
      setTenantPhone('');
      setTenantRent('');
      setTenantHouseNumber('');
      fetchTenants();
    } catch (err) {
      setTenantError(err.message);
    }
  }

  // Add Tenant Modal UI
  {addTenantModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={() => setAddTenantModal(false)}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4">Add Tenant</h3>
        {tenantError && <div className="mb-2 text-red-600 text-center">{tenantError}</div>}
        {tenantMsg && <div className="mb-2 text-green-600 text-center">{tenantMsg}</div>}
        <form onSubmit={handleAddTenant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Property</label>
            <select
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              required
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          {propertyUnits.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">House Number</label>
              <select
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
                className="w-full border p-2 rounded mb-2"
                required
              >
                <option value="">Select House Number</option>
                {propertyUnits.map(u => (
                  <option key={u.label} value={u.label}>House Number {u.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">House Number</label>
              <input
                type="text"
                value={tenantHouseNumber}
                onChange={e => setTenantHouseNumber(e.target.value)}
                className="w-full border p-2 rounded mb-2"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
            <input type="text" className="w-full border rounded p-2" value={tenantName} onChange={e => setTenantName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant Email</label>
            <input type="email" className="w-full border rounded p-2" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant Phone</label>
            <input type="text" className="w-full border rounded p-2" value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rent Amount</label>
            <input type="number" className="w-full border rounded p-2 bg-gray-100" value={tenantRent} readOnly required />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Add Tenant</button>
        </form>
      </div>
    </div>
  )}

  // Add loading state for tenants
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await getTenants();
      setTenants(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await createTenant(form);
    } else {
      await createTenant(form);
    }
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', house: '', balance: 0 });
    setEditId(null);
    fetchTenants();
  };

  const handleEdit = (tenant) => {
    setForm({ name: tenant.name, email: tenant.email, phone: tenant.phone, house: tenant.house?._id || '', balance: tenant.balance });
    setEditId(tenant._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await createTenant(id);
    fetchTenants();
  };

  // PATCH: getStatus should only show 'Paid Up' if balance is 0 and deposit+rent >= rentAmount*2
  function getStatus(tenant) {
    // Assume deposit is tracked in tenant.deposit, fallback to 0 if not present
    const deposit = tenant.deposit || 0;
    const rentPaid = tenant.rentPaid || 0; // If you track total rent paid
    const totalPaid = deposit + rentPaid;
    // Paid up if balance is 0 and deposit+rent >= rentAmount*2
    if (tenant.balance === 0 && totalPaid >= (tenant.rentAmount || 0) * 2) {
      return { label: 'Paid Up', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} className="inline mr-1 text-green-500" /> };
    }
    return { label: 'In Arrears', color: 'bg-red-100 text-red-700', icon: <AlertTriangle size={16} className="inline mr-1 text-red-500" /> };
  }

  // Filter/search logic
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
      (t.phone && t.phone.toLowerCase().includes(search.toLowerCase()));
    const matchesProperty = propertyFilter ? (t.house && t.house._id === propertyFilter) : true;
    const matchesStatus = statusFilter
      ? (statusFilter === 'vacant' ? !t.house : statusFilter === 'arrears' ? t.balance > 0 : t.balance === 0 && t.house)
      : true;
    return matchesSearch && matchesProperty && matchesStatus;
  });

  // Mock payment history for modal
  function getPaymentHistory(tenant) {
    return [
      { date: '2024-07-01', amount: tenant.rentAmount, status: tenant.balance > 0 ? 'Partial' : 'Full' },
      { date: '2024-06-01', amount: tenant.rentAmount, status: 'Full' },
    ];
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Tenants</h2>
      {/* Filters/Search */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-white p-4 rounded-xl shadow">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            className="border rounded pl-10 pr-8 py-2 w-64 focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search tenants"
          />
          <Search size={18} className="absolute left-2 top-2.5 text-gray-400" />
          {search && <button className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500" onClick={() => setSearch('')} aria-label="Clear search"><XCircle size={18} /></button>}
        </div>
        <div className="relative">
          <select
            className="border rounded pl-8 pr-2 py-2 min-w-[160px] focus:ring-2 focus:ring-indigo-500"
            value={propertyFilter}
            onChange={e => setPropertyFilter(e.target.value)}
            aria-label="Filter by property"
          >
            <option value="">All Properties</option>
            {/* houses.map(h => ( // houses is no longer defined */}
            {/*   <option key={h._id} value={h._id}>{h.houseNumber || h.location}</option> */}
            {/* ))} */}
          </select>
          <Filter size={16} className="absolute left-2 top-2.5 text-gray-400" />
        </div>
        <div className="relative">
          <select
            className="border rounded pl-8 pr-2 py-2 min-w-[140px] focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid Up</option>
            <option value="arrears">In Arrears</option>
            <option value="vacant">Vacant</option>
          </select>
          <Filter size={16} className="absolute left-2 top-2.5 text-gray-400" />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Property</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">House</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Balance</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3 animate-pulse"><div className="h-4 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filteredTenants.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">No tenants found.</td></tr>
            ) : filteredTenants.map((t, idx) => {
              const status = getStatus(t);
              return (
                <tr
                  key={t._id}
                  className={`border-t cursor-pointer transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50'} hover:bg-indigo-100 focus-within:bg-indigo-200`}
                  onClick={() => { setSelectedTenant(t); setShowModal(true); }}
                  tabIndex={0}
                  aria-label={`View details for ${t.name}`}
                >
                  <td className="px-4 py-3 font-semibold text-indigo-700">{t.name}</td>
                  <td className="px-4 py-3">{t.email}</td>
                  <td className="px-4 py-3">{t.phone}</td>
                  <td className="px-4 py-3">{t.property ? t.property.name : '-'}</td>
                  <td className="px-4 py-3">{t.houseNumber || '-'}</td>
                  <td className="px-4 py-3">${t.balance}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${status.label === 'Paid Up' ? 'bg-green-100 text-green-700' : status.label === 'In Arrears' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`} title={status.label}>
                      {status.icon}{status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" onClick={e => { e.stopPropagation(); handleEdit(t); }} aria-label={`Edit ${t.name}`}>Edit</button>
                    <button className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded" onClick={e => { e.stopPropagation(); handleDelete(t._id); }} aria-label={`Delete ${t.name}`}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Tenant Detail Modal */}
      {showModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-700"><Info className="mr-2 text-indigo-600" />Tenant Details</h3>
            <div className="mb-2"><b>Name:</b> {selectedTenant.name}</div>
            <div className="mb-2"><b>Email:</b> {selectedTenant.email}</div>
            <div className="mb-2"><b>Phone:</b> {selectedTenant.phone}</div>
            <div className="mb-2"><b>Property:</b> {selectedTenant.property ? selectedTenant.property.name : '-'}</div>
            <div className="mb-2"><b>House:</b> {selectedTenant.houseNumber || '-'}</div>
            <div className="mb-2"><b>Balance:</b> ${selectedTenant.balance}</div>
            <div className="mb-2"><b>Status:</b> <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getStatus(selectedTenant).label === 'Paid Up' ? 'bg-green-100 text-green-700' : getStatus(selectedTenant).label === 'In Arrears' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`} title={getStatus(selectedTenant).label}>{getStatus(selectedTenant).icon}{getStatus(selectedTenant).label}</span></div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><User size={16} className="text-indigo-600" />Payment History</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2 border font-semibold text-gray-700">Date</th>
                      <th className="px-2 py-2 border font-semibold text-gray-700">Amount</th>
                      <th className="px-2 py-2 border font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaymentHistory(selectedTenant).map((p, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                        <td className="px-2 py-2 border">{p.date}</td>
                        <td className="px-2 py-2 border">${p.amount}</td>
                        <td className="px-2 py-2 border">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${p.status === 'Full' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`} title={p.status === 'Full' ? 'Full Payment' : 'Partial Payment'}>
                            {p.status === 'Full' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantsPage; 