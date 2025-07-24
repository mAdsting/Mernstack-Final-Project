import express from 'express';
import Event from '../models/Event.js';
import { body, validationResult } from 'express-validator';

const ROLES = {
  ADMIN: 'admin',
  LANDLORD: 'landlord',
  AGENT: 'agent',
};

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// List all events for landlord
router.get('/', async (req, res) => {
  console.log('Events route hit, headers:', req.headers);
  try {
    if (typeof Event === 'undefined') {
      return res.json([]); // Fallback if Event model is missing
    }
    const events = await Event.find();
    res.json(Array.isArray(events) ? events : []);
  } catch (err) {
    console.error('Events route error:', err);
    res.status(500).json({ message: err.message || 'Server error.' });
  }
});

// Create event
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required.'),
    body('start').isISO8601().toDate().withMessage('Valid start date is required.'),
    body('type').optional().isIn(['rent_due', 'lease_expiry', 'reminder', 'custom']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const event = await Event.create({
        ...req.body,
        landlord: req.user.userId,
        createdBy: req.user.userId,
      });
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// Update event
router.put(
  '/:id',
  [
    body('title').optional().notEmpty(),
    body('start').optional().isISO8601().toDate(),
    body('type').optional().isIn(['rent_due', 'lease_expiry', 'reminder', 'custom']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const event = await Event.findOneAndUpdate(
        { _id: req.params.id, landlord: req.user.userId },
        req.body,
        { new: true }
      );
      if (!event) return res.status(404).json({ message: 'Event not found.' });
      res.json(event);
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, landlord: req.user.userId });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router; 