import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['flat', 'bungalow'],
    required: true,
  },
  numUnits: {
    type: Number,
    required: true,
    min: 1,
  },
  units: [{
    label: { type: String, required: true },
    type: { type: String, default: 'bedsitter' },
    rent: { type: Number, required: true, min: 0 },
    floor: { type: Number, required: true },
  }],
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
export default Property; 