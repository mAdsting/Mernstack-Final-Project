import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Home, Eye, Edit, Trash2, Users } from 'lucide-react';

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [showPropModal, setShowPropModal] = useState(false);
  const [propName, setPropName] = useState('');
  const [propLocation, setPropLocation] = useState('');
  const [propType, setPropType] = useState('flat');
  const [propNumHouses, setPropNumHouses] = useState(1);
  const [propError, setPropError] = useState('');
  const [propMsg, setPropMsg] = useState('');

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantMsg, setTenantMsg] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantHouseNumber, setTenantHouseNumber] = useState('');
  const [tenantRentAmount, setTenantRentAmount] = useState('');

  const navigate = useNavigate();

  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({ open: false, propertyId: null, propType: '', propName: '' });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProps(true);
      setPropError('');
      try {
        const response = await fetch('/api/properties', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setPropError('Could not load properties.');
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProperties();
  }, []);

  // Fetch tenants for a property
  const fetchTenants = async (propertyId) => {
    setLoadingTenants(true);
    setTenantError('');
    try {
      const response = await fetch(`/api/tenants?property=${propertyId}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      setTenantError('Could not load tenants.');
    } finally {
      setLoadingTenants(false);
    }
  };

  // Add or Edit property handler
  const handleAddProperty = async (e) => {
    e.preventDefault();
    setPropError('');
    setPropMsg('');
    if (!propName || !propLocation || !propType || !propNumHouses) {
      setPropError('All fields are required.');
      return;
    }
    try {
      let response, data;
      if (selectedProperty) {
        // Edit mode
        response = await fetch(`/api/properties/${selectedProperty._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: propName,
            location: propLocation,
            type: propType,
            numHouses: propNumHouses,
          }),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error updating property');
        setPropMsg('Property updated successfully!');
        setProperties((prev) => prev.map((p) => p._id === selectedProperty._id ? data : p));
      } else {
        // Add mode
        response = await fetch('/api/properties', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: propName,
            location: propLocation,
            type: propType,
            numHouses: propNumHouses,
          }),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error adding property');
        setPropMsg('Property added successfully!');
        setProperties((prev) => [...prev, data]);
      }
      setShowPropModal(false);
      setPropName('');
      setPropLocation('');
      setPropType('flat');
      setPropNumHouses(1);
      setSelectedProperty(null); // Reset selected property after add/edit
    } catch (err) {
      setPropError(err.message);
    }
  };

  // Add tenant handler
  const handleAddTenant = async (e) => {
    e.preventDefault();
    setTenantError('');
    setTenantMsg('');
    if (!tenantName || !tenantHouseNumber || !tenantRentAmount) {
      setTenantError('All fields are required.');
      return;
    }
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          property: selectedProperty._id,
          name: tenantName,
          houseNumber: tenantHouseNumber,
          rentAmount: tenantRentAmount,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error adding tenant');
      setTenantMsg('Tenant added successfully!');
      setTenants((prev) => [...prev, data]);
      setShowTenantModal(false);
      setTenantName('');
      setTenantHouseNumber('');
      setTenantRentAmount('');
    } catch (err) {
      setTenantError(err.message);
    }
  };

  // Delete tenant handler
  const handleDeleteTenant = async (tenantId) => {
    setTenantError('');
    setTenantMsg('');
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error deleting tenant');
      setTenantMsg('Tenant deleted.');
      setTenants((prev) => prev.filter((t) => t._id !== tenantId));
    } catch (err) {
      setTenantError(err.message);
    }
  };

  // Mark tenant as paid
  const handleMarkPaid = async (tenantId) => {
    setTenantError('');
    setTenantMsg('');
    try {
      const response = await fetch(`/api/tenants/${tenantId}/pay`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error updating payment status');
      setTenantMsg('Tenant marked as paid.');
      setTenants((prev) => prev.map((t) => t._id === tenantId ? { ...t, paymentStatus: 'paid' } : t));
    } catch (err) {
      setTenantError(err.message);
    }
  };

  // Show modal instead of window.confirm
  const handleDeleteProperty = (propertyId, propType, propName) => {
    setDeleteModal({ open: true, propertyId, propType, propName });
  };

  // Confirm delete action
  const confirmDeleteProperty = async () => {
    const { propertyId } = deleteModal;
    setDeleteModal({ open: false, propertyId: null, propType: '', propName: '' });
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete property');
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      alert('Error deleting property: ' + err.message);
    }
  };

  // Edit: pre-fill modal with property data
  const handleEditProperty = (prop) => {
    setSelectedProperty(prop);
    setPropName(prop.name);
    setPropLocation(prop.location);
    setPropType(prop.type);
    setPropNumHouses(prop.numHouses);
    setShowPropModal(true);
  };

  // View: navigate to property detail page
  const handleViewProperty = (prop) => {
    navigate(`/properties/${prop._id}`);
  };

  // Helper: get occupancy for a property
  function getOccupancy(prop) {
    if (!prop.houses || prop.houses.length === 0) return null;
    const occupied = prop.houses.filter(h => h.tenant).length;
    return `${occupied}/${prop.houses.length}`;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 max-w-7xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-indigo-700 tracking-tight">My Properties</h2>
        <button
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          onClick={() => navigate('/properties/add')}
          aria-label="Add Property"
          title="Add a new property"
        >
          <PlusCircle size={20} /> <span className="font-semibold">Add Property</span>
        </button>
      </div>
      {propMsg && <div className="mb-2 text-green-600 text-center font-medium">{propMsg}</div>}
      {propError && <div className="mb-2 text-red-600 text-center font-medium">{propError}</div>}
      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loadingProps ? (
          <div className="col-span-full text-center text-gray-500">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No properties found.</div>
        ) : (
          properties.map((prop) => (
            <div
              key={prop._id}
              className="rounded-xl shadow-lg p-6 border-2 border-gray-100 bg-white hover:shadow-2xl hover:border-indigo-400 transition-all duration-200 cursor-pointer group flex flex-col"
              // onClick={() => setSelectedProperty(prop)}
              title="Click to view property stats"
            >
              {/* Property Icon/Image */}
              <div className="flex items-center justify-center mb-3">
                <Home size={36} className="text-indigo-300 group-hover:text-indigo-500 transition" />
              </div>
              <div className="font-bold text-lg text-indigo-800 mb-1 truncate">{prop.name}</div>
              <div className="text-gray-700 mb-1 truncate"><b>Location:</b> {prop.location}</div>
              <div className="text-gray-700 mb-1"><b>Type:</b> {prop.type}</div>
              <div className="text-gray-700 mb-1"><b>Houses:</b> {Array.isArray(prop.houses) && prop.houses.length > 0 ? prop.houses.length : (typeof prop.numHouses === 'number' ? prop.numHouses : 'N/A')}</div>
              {/* Occupancy */}
              {prop.houses && prop.houses.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-green-700 mb-2">
                  <Users size={16} /> <span>Occupancy:</span> <span className="font-semibold">{getOccupancy(prop)}</span>
                </div>
              )}
              {/* Quick Actions */}
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium"
                  onClick={() => handleViewProperty(prop)}
                  title="View Property"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-medium"
                  onClick={() => handleEditProperty(prop)}
                  title="Edit Property"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium"
                  onClick={() => handleDeleteProperty(prop._id, prop.type, prop.name)}
                  title="Delete Property"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal for Add/Edit Property (existing code) */}
      {showPropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-indigo-100">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => { setShowPropModal(false); setSelectedProperty(null); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700">{selectedProperty ? 'Edit Property' : 'Add Property'}</h3>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label htmlFor="propName" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="propName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="propLocation" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  id="propLocation"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propLocation}
                  onChange={(e) => setPropLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="propType" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="propType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propType}
                  onChange={(e) => setPropType(e.target.value)}
                >
                  <option value="flat">Flat</option>
                  <option value="bungalow">Bungalow</option>
                </select>
              </div>
              <div>
                <label htmlFor="propNumHouses" className="block text-sm font-medium text-gray-700">Number of Houses</label>
                <input
                  type="number"
                  id="propNumHouses"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={propNumHouses}
                  onChange={(e) => setPropNumHouses(Number(e.target.value))}
                  required
                  min="1"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold shadow"
              >
                {selectedProperty ? 'Update Property' : 'Add Property'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Add Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-indigo-100">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => setShowTenantModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700">Add Tenant</h3>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="tenantName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="tenantHouseNumber" className="block text-sm font-medium text-gray-700">House</label>
                <input
                  type="text"
                  id="tenantHouseNumber"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={tenantHouseNumber}
                  onChange={(e) => setTenantHouseNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="tenantRentAmount" className="block text-sm font-medium text-gray-700">Rent Amount</label>
                <input
                  type="number"
                  id="tenantRentAmount"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  value={tenantRentAmount}
                  onChange={(e) => setTenantRentAmount(e.target.value)}
                  required
                  min="0"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold shadow"
              >
                Add Tenant
              </button>
            </form>
            {tenantError && <div className="mt-2 text-red-600 text-center font-medium">{tenantError}</div>}
            {tenantMsg && <div className="mt-2 text-green-600 text-center font-medium">{tenantMsg}</div>}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs mx-auto border border-red-200 flex flex-col items-center">
            <div className="text-lg font-bold text-red-600 mb-2">{deleteModal.propType === 'flat' ? 'Delete Flat?' : 'Delete Property?'}</div>
            <div className="text-sm text-gray-700 mb-4 text-center">
              {deleteModal.propType === 'flat' ? (
                <>
                  <span className="font-semibold">{deleteModal.propName}</span><br />
                  <span className="text-red-500 font-semibold">Warning:</span> Deleting this flat will remove <b>all its houses and tenants</b>.<br />
                  This action <b>cannot be undone</b>.<br />
                  Are you sure you want to proceed?
                </>
              ) : (
                <>
                  Are you sure you want to delete <span className="font-semibold">{deleteModal.propName}</span>?
                </>
              )}
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                onClick={() => setDeleteModal({ open: false, propertyId: null, propType: '', propName: '' })}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium"
                onClick={confirmDeleteProperty}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesPage; 