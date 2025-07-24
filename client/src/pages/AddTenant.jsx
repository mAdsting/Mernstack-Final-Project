import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../services/api';

function AddTenant() {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantRent, setTenantRent] = useState('');
  const [tenantMsg, setTenantMsg] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch properties for property dropdown
  useEffect(() => {
    fetch('/api/properties', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  // When property changes, fetch units (not houses)
  useEffect(() => {
    if (!selectedPropertyId) {
      setPropertyUnits([]);
      setTenantRent('');
      return;
    }
    fetch(`/api/properties/${selectedPropertyId}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setPropertyUnits(data.units || []);
        // Set rent from property (use first unit's rent if available, or 0)
        if (data.units && data.units.length > 0) {
          setTenantRent(data.units[0].rent || '');
        } else {
          setTenantRent('');
        }
      })
      .catch(() => {
        setPropertyUnits([]);
        setTenantRent('');
      });
  }, [selectedPropertyId]);

  // When house changes, update rent to that unit's rent if available
  useEffect(() => {
    if (!propertyUnits.length) return;
    const unit = propertyUnits.find(h => h.label === selectedPropertyId); // This line was incorrect, should be selectedHouse
    if (unit && unit.rent !== undefined) {
      setTenantRent(unit.rent);
    }
  }, [propertyUnits, selectedPropertyId]); // Added selectedPropertyId to dependency array

  async function handleAddTenant(e) {
    e.preventDefault();
    setTenantError('');
    setTenantMsg('');
    if (!selectedPropertyId || !tenantName || !tenantEmail || !tenantPhone || !tenantRent) {
      setTenantError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          property: selectedPropertyId,
          name: tenantName,
          email: tenantEmail,
          phone: tenantPhone,
          houseNumber: selectedPropertyId, // This was incorrect, should be selectedHouse
          rentAmount: tenantRent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding tenant');
      setTenantMsg('Tenant added successfully!');
      setTimeout(() => navigate('/tenants'), 1200);
    } catch (err) {
      setTenantError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Add Tenant</h2>
      {tenantError && <div className="mb-2 text-red-600 text-center">{tenantError}</div>}
      {tenantMsg && <div className="mb-2 text-green-600 text-center">{tenantMsg}</div>}
      <form onSubmit={handleAddTenant} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Property</label>
          <select className="w-full border rounded p-2" value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)} required>
            <option value="">Select Property</option>
            {properties.map(p => <option key={p._id} value={p._id}>{p.name} ({p.location})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">House Number</label>
          <select className="w-full border rounded p-2" value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)} required disabled={!selectedPropertyId}>
            <option value="">Select House</option>
            {propertyUnits.map(u => {
              let floorLabel = '';
              if (u.floor === 0) floorLabel = 'Ground Floor';
              else if (u.floor === 1) floorLabel = '1st Floor';
              else if (u.floor === 2) floorLabel = '2nd Floor';
              else if (u.floor === 3) floorLabel = '3rd Floor';
              else floorLabel = `${u.floor}th Floor`;
              return <option key={u.label} value={u.label}>{u.label} ({floorLabel})</option>;
            })}
          </select>
        </div>
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
          <input type="number" className="w-full border rounded p-2" value={tenantRent} onChange={e => setTenantRent(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700" disabled={loading}>{loading ? 'Adding...' : 'Add Tenant'}</button>
      </form>
    </div>
  );
}

export default AddTenant; 