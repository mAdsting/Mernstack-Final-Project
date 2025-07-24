import express from 'express';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find().populate('property');
    const invoices = tenants.map(t => ({
      tenantName: t.name,
      property: t.property ? t.property.name : '',
      houseNumber: t.houseNumber,
      rentAmount: t.rentAmount,
      balance: t.balance,
      status: t.balance > 0 ? (t.balance === t.rentAmount ? 'Unpaid' : 'Partially Paid') : 'Paid',
      dueDate: t.dueDate || null,
    }));
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});

export default router; 