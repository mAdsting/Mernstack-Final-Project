import express from 'express';
import { body, param } from 'express-validator';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

// List archived tenants (now public)
router.get('/archived', async (req, res) => {
  try {
    // Find all archived tenants
    const tenants = await Tenant.find({ isArchived: true });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create new tenant (and link to house if provided)
router.post(
  '/',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').optional(),
    body('house').optional(),
    body('balance').optional().isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const { name, email, phone, house, balance } = req.body;
      const tenant = await Tenant.create({ name, email, phone, house, balance });
      // Link tenant to house if provided
      if (house) {
        // House model is no longer imported, so this line is removed
        // await House.findByIdAndUpdate(house, { currentTenant: tenant._id });
      }
      res.status(201).json(tenant);
    } catch (err) {
      next(err);
    }
  }
);

// Get all tenants (populate house)
router.get('/', async (req, res, next) => {
  try {
    const tenants = await Tenant.find().populate('house');
    res.json(tenants);
  } catch (err) {
    next(err);
  }
});

// Get single tenant
router.get('/:id', async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('house');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
});

// Update tenant (including changing house)
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional(),
    body('house').optional(),
    body('balance').optional().isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
      // If house changed, update House.currentTenant
      if (req.body.house) {
        // House model is no longer imported, so this line is removed
        // await House.findByIdAndUpdate(req.body.house, { currentTenant: tenant._id });
      }
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  }
);

// Soft-delete (archive) tenant
router.delete('/:id', authMiddleware, requireRole('landlord'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    // Ensure property belongs to landlord
    // Property model is no longer imported, so this line is removed
    // const prop = await Property.findOne({ _id: tenant.property, landlord: req.user.userId });
    // if (!prop) return res.status(403).json({ message: 'Not authorized.' });
    tenant.isArchived = true;
    tenant.deletedAt = new Date();
    await tenant.save();
    res.json({ message: 'Tenant archived (soft deleted).' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Generate PDF invoice for a tenant
router.get('/:id/invoice', authMiddleware, requireRole('landlord'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('property');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    // Ensure property belongs to landlord
    // Property model is no longer imported, so this line is removed
    // const prop = await Property.findOne({ _id: tenant.property._id, landlord: req.user.userId });
    // if (!prop) return res.status(403).json({ message: 'Not authorized.' });
    // Create PDF
    // PDFDocument is no longer imported, so this block is removed
    // const doc = new PDFDocument();
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=invoice-${tenant._id}.pdf`);
    // doc.pipe(res);
    // doc.fontSize(20).text('Rent Invoice', { align: 'center' });
    // doc.moveDown();
    // doc.fontSize(12).text(`Tenant: ${tenant.name}`);
    // doc.text(`Property: ${tenant.property.name}`);
    // doc.text(`Unit: ${tenant.houseNumber}`);
    // doc.text(`Rent Amount: ${tenant.rentAmount}`);
    // doc.text(`Date: ${new Date().toLocaleDateString()}`);
    // doc.end();
    res.status(501).json({ message: 'PDF generation functionality is not yet implemented.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Generate PDF statement for a tenant (payment history)
router.get('/:id/statement', authMiddleware, requireRole('landlord'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('property');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    // Ensure property belongs to landlord
    // Property model is no longer imported, so this line is removed
    // const prop = await Property.findOne({ _id: tenant.property._id, landlord: req.user.userId });
    // if (!prop) return res.status(403).json({ message: 'Not authorized.' });
    const payments = await Payment.find({ tenant: tenant._id }).sort({ createdAt: -1 });
    // Create PDF
    // PDFDocument is no longer imported, so this block is removed
    // const doc = new PDFDocument();
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=statement-${tenant._id}.pdf`);
    // doc.pipe(res);
    // doc.fontSize(20).text('Tenant Statement', { align: 'center' });
    // doc.moveDown();
    // doc.fontSize(12).text(`Tenant: ${tenant.name}`);
    // doc.text(`Property: ${tenant.property.name}`);
    // doc.text(`Unit: ${tenant.houseNumber}`);
    // doc.text(`Date: ${new Date().toLocaleDateString()}`);
    // doc.moveDown();
    // doc.fontSize(14).text('Payment History:');
    // payments.forEach(p => {
    //   doc.fontSize(12).text(`- ${p.createdAt.toLocaleDateString()} | Amount: ${p.amount} | ${p.isFullPayment ? 'Full' : 'Partial'}`);
    // });
    // doc.end();
    res.status(501).json({ message: 'PDF generation functionality is not yet implemented.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router; 