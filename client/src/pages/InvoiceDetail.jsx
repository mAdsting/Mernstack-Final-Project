import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InvoiceDetail() {
  const { tenantId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/invoices`)
      .then(res => res.json())
      .then(data => {
        setInvoice(data.find(inv => (inv.tenantId || String(data.indexOf(inv))) === tenantId));
      });
  }, [tenantId]);

  if (!invoice) return <div>Loading invoice...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <button
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={() => navigate('/invoices')}
      >
        Back
      </button>
      <h2 className="text-xl font-bold mb-4">Invoice for {invoice.tenantName}</h2>
      <div>Property: {invoice.property}</div>
      <div>House: {invoice.houseNumber}</div>
      <div>Rent: Ksh {invoice.rentAmount}</div>
      <div>Balance: Ksh {invoice.balance}</div>
      <div>Status: {invoice.status}</div>
      {/* Add print/download buttons here if needed */}
    </div>
  );
}

export default InvoiceDetail; 