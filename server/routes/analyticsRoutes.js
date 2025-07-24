import express from 'express';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// GET /api/analytics/summary - returns total properties and tenants
router.get('/summary', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const totalTenants = await Tenant.countDocuments();
    res.json({ totalProperties, totalTenants });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.json({ totalProperties: 0, totalTenants: 0 });
  }
});

// GET /api/analytics/rent-collection - returns total rent due and collected for current month
router.get('/rent-collection', async (req, res) => {
  try {
    // Calculate total due: sum of all tenants' rentAmount
    const tenants = await Tenant.find();
    const totalDue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

    // Calculate total collected: sum of all payments made this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const payments = await Payment.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({ totalDue, totalCollected });
  } catch (err) {
    console.error('Rent collection analytics error:', err);
    res.json({ totalDue: 0, totalCollected: 0 });
  }
});

// GET /api/analytics/occupancy - returns occupied and vacant unit counts
router.get('/occupancy', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    const occupied = tenants.length;
    const properties = await Property.find();
    const totalUnits = properties.reduce((sum, p) => sum + (p.units ? p.units.length : p.numUnits || 0), 0);
    const vacant = Math.max(totalUnits - occupied, 0);
    res.json({ occupied, vacant });
  } catch (err) {
    console.error('Occupancy analytics error:', err);
    res.json({ occupied: 0, vacant: 0 });
  }
});

// GET /api/analytics/rent-trend - returns rent due and collected for last 6 months
router.get('/rent-trend', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ date: d, label });
    }
    const tenants = await Tenant.find();
    const Payment = Payment;
    const trend = [];
    for (const m of months) {
      const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
      const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0, 23, 59, 59, 999);
      // Due: sum of rentAmount for all tenants that existed in this month
      const due = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
      // Collected: sum of payments in this month
      const payments = await Payment.find({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      const collected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      trend.push({ month: m.label, due, collected });
    }
    res.json(trend);
  } catch (err) {
    console.error('Rent trend analytics error:', err);
    res.json([]);
  }
});

// GET /api/analytics/overdue-trend - returns overdue tenant count for last 6 months
router.get('/overdue-trend', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ date: d, label });
    }
    const tenants = await Tenant.find();
    const trend = [];
    for (const m of months) {
      // For each month, count tenants with paymentStatus !== 'paid'
      // (Assume all tenants are present for each month for simplicity)
      const overdue = tenants.filter(t => t.paymentStatus !== 'paid').length;
      trend.push({ month: m.label, overdue });
    }
    res.json(trend);
  } catch (err) {
    console.error('Overdue trend analytics error:', err);
    res.json([]);
  }
});

// GET /api/analytics/arrears - returns total arrears (unpaid rent)
router.get('/arrears', async (req, res) => {
  try {
    const tenants = await Tenant.find({ paymentStatus: { $ne: 'paid' } });
    const totalArrears = tenants.reduce((sum, t) => sum + (t.balance || 0), 0);
    res.json({ totalArrears });
  } catch (err) {
    console.error('Arrears analytics error:', err);
    res.json({ totalArrears: 0 });
  }
});

// GET /api/analytics/total-payments - returns total payments ever made
router.get('/total-payments', async (req, res) => {
  try {
    const Payment = Payment;
    const payments = await Payment.find();
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    res.json({ totalPayments });
  } catch (err) {
    console.error('Total payments analytics error:', err);
    res.json({ totalPayments: 0 });
  }
});

// GET /api/analytics/arrears-trend - returns arrears trend for last 6 months
router.get('/arrears-trend', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ date: d, label });
    }
    const tenants = await Tenant.find();
    const trend = [];
    for (const m of months) {
      // For each month, sum balances of tenants with paymentStatus !== 'paid'
      // (Assume all tenants are present for each month for simplicity)
      const arrears = tenants.filter(t => t.paymentStatus !== 'paid').reduce((sum, t) => sum + (t.balance || 0), 0);
      trend.push({ month: m.label, arrears });
    }
    res.json(trend);
  } catch (err) {
    console.error('Arrears trend analytics error:', err);
    res.json([]);
  }
});

// GET /api/analytics/payments-trend - returns payments trend for last 6 months
router.get('/payments-trend', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ date: d, label });
    }
    const Payment = Payment;
    const trend = [];
    for (const m of months) {
      const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
      const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0, 23, 59, 59, 999);
      const payments = await Payment.find({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      trend.push({ month: m.label, payments: total });
    }
    res.json(trend);
  } catch (err) {
    console.error('Payments trend analytics error:', err);
    res.json([]);
  }
});

// GET /api/analytics/tenants-trend - returns tenants trend for last 6 months
router.get('/tenants-trend', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ date: d, label });
    }
    const tenants = await Tenant.find();
    const trend = months.map(m => ({ month: m.label, tenants: tenants.length }));
    res.json(trend);
  } catch (err) {
    console.error('Tenants trend analytics error:', err);
    res.json([]);
  }
});

router.get('/trends', async (req, res) => {
  try {
    // Monthly rent collected (last 12 months)
    const monthly = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 6-month blocks (last 3 years)
    const sixMonth = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            half: { $ceil: { $divide: [{ $month: '$paymentDate' }, 6] } }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.half': 1 } }
    ]);

    // Yearly rent collected
    const yearly = await Payment.aggregate([
      {
        $group: {
          _id: { $year: '$paymentDate' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Arrears per month (last 12 months)
    const arrearsMonthly = await Tenant.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
          total: { $sum: '$balance' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ monthly, sixMonth, yearly, arrearsMonthly });
  } catch (err) {
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
});

export default router; 