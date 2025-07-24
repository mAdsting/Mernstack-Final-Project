import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
  houseNumber: { type: String, required: true, unique: true, trim: true },
  location: { type: String, required: true, trim: true },
  rentAmount: { type: Number, required: true, min: 0 },
  currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
}, { timestamps: true });

const House = mongoose.model('House', houseSchema);
export default House;
