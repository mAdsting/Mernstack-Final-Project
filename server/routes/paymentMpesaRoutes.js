import express from 'express';
import axios from 'axios';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';

// Africa's Talking SMS setup (optional, only if you have credentials)
let africastalking;
if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
  africastalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });
}

const router = express.Router();

// Helper: Get M-Pesa access token
async function getMpesaToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// Initiate M-Pesa STK Push
router.post('/initiate', async (req, res) => {
  const { phone, amount, accountReference, transactionDesc } = req.body;
  try {
    // 1. Get access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data: tokenRes } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const access_token = tokenRes.access_token;

    // 2. Prepare STK Push request
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    // 3. Send STK Push
    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    res.json({ message: 'STK Push initiated', stkRes: stkRes.data });
  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({ message: 'STK Push failed', error: err.response?.data || err.message });
  }
});

// M-Pesa callback endpoint (update tenant, send SMS)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const callback = req.body.Body.stkCallback;
    const resultCode = callback.ResultCode;
    const metadata = callback.CallbackMetadata;
    if (resultCode === 0 && metadata) {
      const amount = metadata.Item.find(i => i.Name === 'Amount')?.Value;
      const mpesaReceipt = metadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const accountNumber = metadata.Item.find(i => i.Name === 'AccountReference')?.Value;
      // Parse accountNumber as 'propertyId-unitLabel'
      let propertyId, houseNumber;
      if (accountNumber && accountNumber.includes('-')) {
        [propertyId, houseNumber] = accountNumber.split('-');
      }
      // Find the tenant by property and house number
      let tenant = null;
      if (propertyId && houseNumber) {
        tenant = await Tenant.findOne({ property: propertyId, houseNumber });
      }
      if (tenant) {
        // Update tenant balance
        tenant.balance = (tenant.balance || 0) - amount;
        tenant.paymentStatus = tenant.balance <= 0 ? 'paid' : 'unpaid';
        await tenant.save();
        // Record the payment
        await Payment.create({
          tenant: tenant._id,
          houseNumber,
          amount,
          mpesaReceipt,
          status: 'success',
          method: 'mpesa',
        });
        // Send SMS feedback (if Africa's Talking is configured)
        if (africastalking) {
          const sms = africastalking.SMS;
          const message = `Dear Tenant, your payment of Ksh ${amount} has been received. Balance: Ksh ${tenant.balance}. For complaints, call: 07XXXXXXXX.`;
          sms.send({
            to: [tenant.phone],
            message,
            from: process.env.AT_SENDER_ID || undefined,
          }).catch(e => console.error('SMS error:', e.message));
        }
      }
    }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
});

export default router;
