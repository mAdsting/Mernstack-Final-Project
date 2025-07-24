import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  houseNumber: {
    type: String,
    required: true,
    trim: true,
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid',
  },
  balance: {
    type: Number,
    default: 0,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant; 