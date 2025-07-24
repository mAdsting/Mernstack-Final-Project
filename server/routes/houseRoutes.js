import express from 'express';
import { body, param } from 'express-validator';
import House from '../models/House.js';
import Tenant from '../models/Tenant.js';

const router = express.Router();

// Create new house
router.post(
  '/',
  [
    body('houseNumber').notEmpty(),
    body('location').notEmpty(),
    body('rentAmount').isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const { houseNumber, location, rentAmount } = req.body;
      const house = await House.create({ houseNumber, location, rentAmount });
      res.status(201).json(house);
    } catch (err) {
      next(err);
    }
  }
);

// Get all houses (populate currentTenant)
router.get('/', async (req, res, next) => {
  try {
    const houses = await House.find().populate('currentTenant');
    res.json(houses);
  } catch (err) {
    next(err);
  }
});

// Get houses with unpaid tenants
router.get('/unpaid', async (req, res, next) => {
  try {
    const houses = await House.find().populate('currentTenant');
    const unpaid = houses.filter(
      h => h.currentTenant && h.currentTenant.balance > 0
    );
    res.json(unpaid);
  } catch (err) {
    next(err);
  }
});

// Get single house
router.get('/:id', async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id).populate('currentTenant');
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    next(err);
  }
});

// Update house
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('houseNumber').optional().notEmpty(),
    body('location').optional().notEmpty(),
    body('rentAmount').optional().isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const house = await House.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!house) return res.status(404).json({ message: 'House not found' });
      res.json(house);
    } catch (err) {
      next(err);
    }
  }
);

// Delete house
router.delete('/:id', async (req, res, next) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json({ message: 'House deleted' });
  } catch (err) {
    next(err);
  }
});

export default router; 