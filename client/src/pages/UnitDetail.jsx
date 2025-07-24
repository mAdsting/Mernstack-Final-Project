import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowLeft, CreditCard } from 'lucide-react';
import { getAuthHeaders } from '../services/api';

function UnitDetail() {
  const { propertyId, unitId } = useParams();
  const [unit, setUnit] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Replace with real API call
    const fetchUnit = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/properties/${propertyId}/houses/${unitId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch house');
        const data = await res.json();
        setUnit(data.house);
        setPayments(data.payments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [propertyId, unitId]);

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-gray-200 rounded mb-4"></div><div className="h-6 w-32 bg-gray-100 rounded mb-2"></div><div className="h-40 w-full bg-gray-100 rounded"></div></div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!unit) return <div className="p-8">House not found.</div>;

  const statusBadge = unit.tenant ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold"><CheckCircle size={14} /> Occupied</span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-semibold"><AlertTriangle size={14} /> Vacant</span>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link to={`/properties/${propertyId}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4"><ArrowLeft size={18} />Back to Property</Link>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">{unit.label} <span className="text-base font-normal text-gray-500">({unit.type})</span></h2>
          {statusBadge}
        </div>
        <div className="mb-2">Rent: <span className="font-semibold">${unit.rent}</span></div>
        {unit.tenant && (
          <div className="mt-2 text-sm bg-indigo-50 rounded p-2">
            <div className="font-semibold text-indigo-700 flex items-center gap-1"><User size={16} />Tenant: {unit.tenant.name}</div>
            <div>Email: {unit.tenant.email}</div>
            <div>Phone: {unit.tenant.phone}</div>
            <div>Balance: <span className={unit.tenant.balance > 0 ? 'text-red-600' : 'text-green-700'}>${unit.tenant.balance}</span></div>
          </div>
        )}
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><CreditCard size={18} className="text-indigo-600" />Payment History</h3>
        {payments.length === 0 ? (
          <div className="text-gray-500">No payment history found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 border font-semibold text-gray-700">Date</th>
                  <th className="px-2 py-2 border font-semibold text-gray-700">Tenant</th>
                  <th className="px-2 py-2 border font-semibold text-gray-700">Amount</th>
                  <th className="px-2 py-2 border font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                    <td className="px-2 py-2 border">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-2 py-2 border">{p.tenantName}</td>
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
        )}
      </div>
    </div>
  );
}

export default UnitDetail; 