const path = require('path');
const Order = require('../models/Order');

const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('product', 'name brand supplierCost')
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }) // Ensure it only gets the current user's orders
      .populate('product')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const User = require('../models/User');
const path = require('path');
const axios = require('axios');
const PAYSTACK_SECRET = (process.env.PAYSTACK_SECRET_KEY || '').replace(/[\r\n\t"]/g, '').trim();
const nodemailer = require('nodemailer');
const { generateReceipt } = require('../utils/receiptGenerator');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : 'customer@pde.com';

    // 1. Initialize Paystack Transaction
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: userEmail,
        amount: Math.round(totalAmount * 100), // Convert GHS to pesewas (subunits)
        currency: 'GHS',
        callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success`,
        metadata: {
          userId,
          items: items.map(i => i.productId)
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { authorization_url, reference } = paystackResponse.data.data;

    // 2. Create Pending Orders in DB
    const createdOrders = [];
    for (const item of items) {
      const order = await Order.create({
        user: userId,
        product: item.productId,
        batch: item.batchId || '65ff5a5a1c2d3e4f5a6b7c8d',
        quantity: item.quantity,
        totalPrice: item.lineTotal,
        depositStatus: 'Pending',
        orderStatus: 'Confirmed',
        paymentReference: reference
      });
      createdOrders.push(order);
    }

    res.status(201).json({
      message: 'Checkout initialized',
      authorization_url,
      reference,
      orders: createdOrders
    });
  } catch (err) {
    console.error('Paystack Init Error:', err.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    const { status, amount } = paystackResponse.data.data;

    if (status === 'success') {
      // Update all orders with this reference to Paid
      await Order.updateMany(
        { paymentReference: reference },
        { 
          depositStatus: 'Paid',
          amountPaid: amount / 100 
        }
      );

      // Fetch full order details for receipt
      const orders = await Order.find({ paymentReference: reference }).populate('product');
      
      if (!orders || orders.length === 0) {
        return res.status(404).json({ status: 'failed', message: 'Payment verified, but no local orders found.' });
      }

      const user = await User.findById(orders[0].user);
      
      const receiptData = {
        reference,
        userName: user?.name || 'Valued Client',
        userEmail: user?.email || paystackResponse.data.data.customer.email || 'customer@pde.com',
        totalAmount: amount ? amount / 100 : 0,
        items: orders.map(o => ({
          name: o.product?.name || 'Unknown Fragrance',
          quantity: o.quantity || 1,
          price: o.totalPrice || 0
        }))
      };

      const receiptsDir = path.join(__dirname, '..', 'receipts');
      const receiptPath = path.join(receiptsDir, `receipt_${reference}.pdf`);
      if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);

      await generateReceipt(receiptData, receiptPath);

      // Send Email
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: '"Parfum d\'Élite" <customer@pde.com>',
            to: receiptData.userEmail,
            subject: 'PDE Allocation Secured - Your Branded Receipt',
            text: 'Welcome to the Elite. Your allocation has been secured. Find your receipt attached.',
            attachments: [{ filename: `PDE_Receipt_${reference}.pdf`, path: receiptPath }]
          });
        } catch (emailErr) {
          console.error('Email sending failed:', emailErr.message);
        }
      } else {
        console.warn('GMAIL_USER and GMAIL_PASS not configured. Receipt email not sent.');
      }

      res.status(200).json({ status: 'success', message: 'Payment verified (email receipt skipped/failed if no credentials).' });
    } else {
      res.status(400).json({ status: 'failed', message: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.orderStatus = orderStatus;
    await order.save();
    
    res.status(200).json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const downloadReceipt = async (req, res) => {
  try {
    const { reference } = req.params;
    const receiptsDir = path.join(__dirname, '..', 'receipts');
    const receiptPath = path.join(receiptsDir, `receipt_${reference}.pdf`);

    if (fs.existsSync(receiptPath)) {
      res.download(receiptPath);
    } else {
      // Regenerate if missing
      const orders = await Order.find({ paymentReference: reference }).populate('product');
      if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
      
      const user = await User.findById(orders[0].user);
      const receiptData = {
        reference,
        userName: user?.name,
        userEmail: user?.email,
        totalAmount: orders.reduce((sum, o) => sum + o.totalPrice, 0),
        items: orders.map(o => ({
          name: o.product.name,
          quantity: o.quantity,
          price: o.totalPrice
        }))
      };
      
      if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);
      await generateReceipt(receiptData, receiptPath);
      res.download(receiptPath);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Paystack Charge API (Custom Embedded Checkout) ─────────────────────────

const chargeCard = async (req, res) => {
  try {
    const { cardNumber, cvv, expiryMonth, expiryYear, items, totalAmount, shippingAddress, shippingMethod, selectedSamples } = req.body;
    const userEmail = req.user.email;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!cardNumber || !cvv || !expiryMonth || !expiryYear) {
      return res.status(400).json({ message: 'Card details are incomplete' });
    }

    const amountInPesewas = Math.round(totalAmount * 100);

    const paystackResponse = await axios.post(
      'https://api.paystack.co/charge',
      {
        email: userEmail,
        amount: amountInPesewas,
        currency: 'GHS',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          cvv,
          expiry_month: String(expiryMonth).trim(),
          expiry_year: String(expiryYear).trim()
        },
        metadata: {
          userId,
          shippingMethod: shippingMethod || 'Ground',
          items: items.map(i => i.productId),
          selectedSamples: selectedSamples || []
        }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    );

    const { status, reference, display_text, url } = paystackResponse.data.data;

    // Create pending orders immediately so we can update them on success/OTP verify
    for (const item of items) {
      await Order.create({
        user: userId,
        product: item.productId,
        batch: item.batchId || '65ff5a5a1c2d3e4f5a6b7c8d',
        quantity: item.quantity,
        totalPrice: item.lineTotal,
        depositStatus: status === 'success' ? 'Paid' : 'Pending',
        orderStatus: 'Confirmed',
        paymentReference: reference,
        paymentChannel: 'card',
        shippingAddress: shippingAddress || {},
        shippingMethod: shippingMethod || 'Ground'
      });
    }

    return res.status(200).json({ status, reference, display_text, url });
  } catch (err) {
    console.error('Card Charge Error:', err.response?.data || err.message);
    const paystackMsg = err.response?.data?.message || err.response?.data?.data?.message;
    const httpStatus = err.response ? 400 : 500;
    res.status(httpStatus).json({ message: paystackMsg || err.message });
  }
};

const chargeSubmitOtp = async (req, res) => {
  try {
    const { otp, reference } = req.body;
    if (!otp || !reference) return res.status(400).json({ message: 'OTP and reference are required' });

    const response = await axios.post(
      'https://api.paystack.co/charge/submit_otp',
      { otp, reference },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const { status, display_text, url } = response.data.data;

    if (status === 'success') {
      await Order.updateMany(
        { paymentReference: reference },
        { depositStatus: 'Paid' }
      );
      return res.status(200).json({ status: 'success', reference });
    }

    return res.status(200).json({ status, display_text, url });
  } catch (err) {
    console.error('Submit OTP Error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
};

const chargeMoMo = async (req, res) => {
  try {
    const { phone, provider, items, totalAmount, shippingAddress, shippingMethod, selectedSamples } = req.body;
    const userEmail = req.user.email;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!phone || !provider) {
      return res.status(400).json({ message: 'Phone and provider are required' });
    }

    const amountInPesewas = Math.round(totalAmount * 100);

    const paystackResponse = await axios.post(
      'https://api.paystack.co/charge',
      {
        email: userEmail,
        amount: amountInPesewas,
        currency: 'GHS',
        mobile_money: {
          phone: phone.replace(/\s/g, ''),
          provider // 'mtn' | 'vod' (Telecel) | 'tgo' (AirtelTigo)
        },
        metadata: {
          userId,
          shippingMethod: shippingMethod || 'Ground',
          items: items.map(i => i.productId),
          selectedSamples: selectedSamples || []
        }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    );

    const { status, reference, display_text } = paystackResponse.data.data;

    // Create pending orders — they'll be marked Paid when webhook/verify fires
    for (const item of items) {
      await Order.create({
        user: userId,
        product: item.productId,
        batch: item.batchId || '65ff5a5a1c2d3e4f5a6b7c8d',
        quantity: item.quantity,
        totalPrice: item.lineTotal,
        depositStatus: 'Pending',
        orderStatus: 'Confirmed',
        paymentReference: reference,
        paymentChannel: 'mobile_money',
        shippingAddress: shippingAddress || {},
        shippingMethod: shippingMethod || 'Ground'
      });
    }

    return res.status(200).json({ status, reference, display_text });
  } catch (err) {
    console.error('MoMo Charge Error:', err.response?.data || err.message);
    const paystackMsg = err.response?.data?.message || err.response?.data?.data?.message;
    const httpStatus = err.response ? 400 : 500;
    res.status(httpStatus).json({ message: paystackMsg || err.message });
  }
};

module.exports = { getAdminOrders, getMyOrders, createOrder, checkMilestones, updateOrderStatus, verifyPayment, downloadReceipt, chargeCard, chargeSubmitOtp, chargeMoMo };
