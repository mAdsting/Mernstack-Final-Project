import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date },
  type: { type: String, enum: ['rent_due', 'lease_expiry', 'reminder', 'custom'], default: 'custom' },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema); 