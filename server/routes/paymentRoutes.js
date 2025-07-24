import express from 'express';
import { body } from 'express-validator';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import House from '../models/House.js';
import Property from '../models/Property.js';

const router = express.Router();

// Record a manual payment
router.post(
  '/record',
  [
    body('tenantId').isMongoId(),
    body('houseId').isMongoId(),
    body('amount').isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const { tenantId, houseId, amount } = req.body;
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
      const house = await House.findById(houseId);
      if (!house) return res.status(404).json({ message: 'House not found' });

      // Update tenant balance
      tenant.balance = Math.max(0, tenant.balance - amount);
      await tenant.save();

      // Create payment record
      const payment = await Payment.create({
        tenant: tenantId,
        house: houseId,
        amount,
        isFullPayment: tenant.balance === 0,
      });

      // Emit payment notification via Socket.io
      req.app.get('io').emit('paymentNotification', {
        message: `Payment of $${amount} received for House ${house.houseNumber} from Tenant ${tenant.name}. New balance: $${tenant.balance}`,
        tenant: tenant.name,
        house: house.houseNumber,
        amount,
        balance: tenant.balance,
        timestamp: new Date(),
      });

      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  }
);

// Get all payment history
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('tenant')
      .sort({ paymentDate: -1 });
    const paymentsWithDetails = await Promise.all(payments.map(async p => {
      let property = '';
      let houseNumber = '';
      if (p.tenant) {
        houseNumber = p.tenant.houseNumber;
        const prop = await Property.findById(p.tenant.property);
        property = prop ? prop.name : '';
      }
      return {
        date: p.paymentDate,
        amount: p.amount,
        tenant: p.tenant ? p.tenant.name : '',
        property,
        houseNumber,
        method: p.method,
        status: p.status,
        mpesaReceipt: p.mpesaReceipt || '',
      };
    }));
    res.json(paymentsWithDetails);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
});

export default router; 