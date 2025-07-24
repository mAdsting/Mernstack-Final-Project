import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, UserX, Home, MapPin, ListChecks, ArrowLeft } from 'lucide-react';
import { getAuthHeaders } from '../services/api';

function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showViz, setShowViz] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Replace with real API call
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/properties/${id}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch property');
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Helper to determine house status and color
  function getHouseStatus(house) {
    if (!house.tenant) return { label: 'Vacant', color: 'border-gray-300 bg-gray-50 text-gray-500', icon: <UserX className="inline mr-1 text-gray-400" size={18} /> };
    if (house.tenant.balance > 0) return { label: 'In Arrears', color: 'border-red-400 bg-red-50 text-red-700', icon: <AlertTriangle className="inline mr-1 text-red-500" size={18} /> };
    return { label: 'Paid Up', color: 'border-green-400 bg-green-50 text-green-700', icon: <CheckCircle className="inline mr-1 text-green-500" size={18} /> };
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-gray-200 rounded mb-4"></div><div className="h-6 w-32 bg-gray-100 rounded mb-2"></div><div className="h-40 w-full bg-gray-100 rounded"></div></div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!property) return <div className="p-8">Property not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Arrow */}
      <button
        className="flex items-center gap-2 mb-4 text-indigo-600 hover:text-indigo-800 font-medium"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} /> Back
      </button>
      {/* Property details below */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Home size={24} className="text-indigo-600" />{property.name} <span className="text-base font-normal text-gray-500">({property.type})</span></h2>
          <div className="mb-2 text-gray-700 flex items-center gap-2"><MapPin size={18} className="text-gray-400" />Location: {property.location}</div>
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-2 text-gray-600 flex items-center gap-2"><ListChecks size={18} className="text-green-500" />Amenities: <span className="text-xs text-gray-500">{property.amenities.join(', ')}</span></div>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="text-sm text-gray-500">Added: {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : ''}</div>
          <div className="text-sm text-gray-500">Houses: {property.units?.length || property.numUnits}</div>
        </div>
      </div>
      {property.type === 'flat' && (
        <button
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          onClick={() => setShowViz(true)}
        >
          Visualize Flats
        </button>
      )}
      {showViz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => setShowViz(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700">Flat Visualization (Coming Soon)</h3>
            <div className="text-gray-500">A beautiful interactive visualization of the flats will appear here.</div>
          </div>
        </div>
      )}
      {property.type === 'flat' ? (
        <>
          {/* Sticky Legend */}
          <div className="flex items-center gap-6 mb-4 sticky top-0 z-10 bg-white/80 py-2 rounded shadow-sm">
            <div className="flex items-center gap-1 text-gray-500" title="Vacant"><UserX size={18} className="mr-1" /> Vacant</div>
            <div className="flex items-center gap-1 text-green-700" title="Paid Up"><CheckCircle size={18} className="mr-1" /> Paid Up</div>
            <div className="flex items-center gap-1 text-red-700" title="In Arrears"><AlertTriangle size={18} className="mr-1" /> In Arrears</div>
          </div>
          <div className="mb-4 text-lg font-semibold">Houses</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {property.units && property.units.length > 0 ? property.units.map(house => {
              const status = getHouseStatus(house);
              let floorLabel = '';
              if (house.floor === 0) floorLabel = 'Ground Floor';
              else if (house.floor === 1) floorLabel = '1st Floor';
              else if (house.floor === 2) floorLabel = '2nd Floor';
              else if (house.floor === 3) floorLabel = '3rd Floor';
              else floorLabel = `${house.floor}th Floor`;
              return (
                <Link
                  to={`/properties/${property._id}/houses/${house._id}`}
                  key={house._id}
                  className={`block border rounded-xl p-5 shadow-md hover:shadow-xl transition cursor-pointer ${status.color} hover:scale-[1.03] focus:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  title={status.label}
                  tabIndex={0}
                >
                  <div className="font-bold text-indigo-700 mb-1 flex items-center gap-2">House {house.label} <span className="text-xs text-gray-500">({floorLabel})</span></div>
                  <div>Rent: <span className="font-semibold">${house.rent}</span></div>
                  <div className={`mt-1 font-semibold flex items-center gap-1 ${status.color.split(' ').find(c => c.startsWith('text-'))}`}>{status.icon}{status.label}</div>
                  {house.tenant && (
                    <div className="mt-2 text-sm bg-indigo-50 rounded p-2">
                      <div className="font-semibold text-indigo-700 flex items-center gap-1"><UserX size={16} />Tenant: {house.tenant.name}</div>
                      <div>Email: {house.tenant.email}</div>
                      <div>Phone: {house.tenant.phone}</div>
                      <div>Balance: <span className={house.tenant.balance > 0 ? 'text-red-600' : 'text-green-700'}>${house.tenant.balance}</span></div>
                    </div>
                  )}
                </Link>
              );
            }) : <div>No houses found.</div>}
          </div>
        </>
      ) : (
        <div className="mt-4">
          <div>Bedrooms: {property.bedrooms}</div>
          <div>Servant Quarters: {property.servantQuarters}</div>
          <div>Rent: ${property.rent}</div>
          {property.tenant ? (
            <div className="mt-2 text-sm">
              <div>Tenant: {property.tenant.name}</div>
              <div>Email: {property.tenant.email}</div>
              <div>Phone: {property.tenant.phone}</div>
              <div>Balance: ${property.tenant.balance}</div>
            </div>
          ) : <div className="text-gray-500">Vacant</div>}
        </div>
      )}
    </div>
  );
}

export default PropertyDetail; 