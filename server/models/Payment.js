import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  isFullPayment: { type: Boolean, default: false },
  mpesaReceipt: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  method: { type: String, default: 'mpesa' },
  houseNumber: { type: String },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
