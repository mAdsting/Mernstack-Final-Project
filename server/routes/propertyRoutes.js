import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import mongoose from 'mongoose';
const router = express.Router();

// Property detail endpoint and other /:id routes should come after /analytics
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  // Only allow valid ObjectId, otherwise return 404
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Not found.' });
  }
  try {
    const property = await Property.findOne({ _id: id });
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    // Return property details including units
    return res.json({
      _id: property._id,
      name: property.name,
      location: property.location,
      type: property.type,
      numUnits: property.numUnits,
      units: property.units || [],
    });
  } catch (err) {
    console.error('Property detail error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add DELETE /api/properties/:id route
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Property not found.' });
    res.json({ message: 'Property deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Placeholder: Add more property routes as needed

export default router; 