import React, { useEffect, useState } from 'react';

function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(setPayments);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Payments</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Tenant</th>
            <th className="px-4 py-2">Property</th>
            <th className="px-4 py-2">House</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Method</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{new Date(p.date).toLocaleString()}</td>
              <td className="px-4 py-2">{p.tenant}</td>
              <td className="px-4 py-2">{p.property}</td>
              <td className="px-4 py-2">{p.houseNumber}</td>
              <td className="px-4 py-2">Ksh {p.amount}</td>
              <td className="px-4 py-2">{p.method}</td>
              <td className={`px-4 py-2 font-semibold ${p.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>{p.status}</td>
              <td className="px-4 py-2">{p.mpesaReceipt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Payments; 