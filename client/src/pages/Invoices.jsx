import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(setInvoices);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Invoices</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Tenant</th>
            <th className="px-4 py-2">Property</th>
            <th className="px-4 py-2">House</th>
            <th className="px-4 py-2">Rent</th>
            <th className="px-4 py-2">Balance</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{inv.tenantName}</td>
              <td className="px-4 py-2">{inv.property}</td>
              <td className="px-4 py-2">{inv.houseNumber}</td>
              <td className="px-4 py-2">Ksh {inv.rentAmount}</td>
              <td className="px-4 py-2">Ksh {inv.balance}</td>
              <td className={`px-4 py-2 font-semibold ${inv.status === 'Paid' ? 'text-green-600' : inv.status === 'Unpaid' ? 'text-red-600' : 'text-yellow-600'}`}>{inv.status}</td>
              <td className="px-4 py-2">
                <button
                  className="text-indigo-600 hover:underline"
                  onClick={() => navigate(`/invoices/${inv.tenantId || i}`)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Invoices; 