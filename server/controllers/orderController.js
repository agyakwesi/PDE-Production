const Order = require('../models/Order');

const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('product', 'name house basePrice')
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const User = require('../models/User');

const checkMilestones = async (user) => {
  const rewards = user.rewards || [];
  if (user.purchaseCount >= 3 && !rewards.includes('3 Purchases Reward')) {
    rewards.push('3 Purchases Reward');
  }
  if (user.purchaseCount >= 5 && !rewards.includes('5 Purchases Reward')) {
    rewards.push('5 Purchases Reward');
  }
  if (user.purchaseCount >= 10 && !rewards.includes('10 Purchases Reward')) {
    rewards.push('10 Purchases Reward');
  }
  user.rewards = rewards;
  await user.save();
};

const createOrder = async (req, res) => {
  try {
    const { productId, batchId, quantity, totalPrice } = req.body;

    // Create the order
    const order = await Order.create({
      user: req.user ? req.user.id : null, // Assuming you have authentication middleware setting req.user
      product: productId,
      batch: batchId,
      quantity,
      totalPrice,
      depositStatus: 'Pending',
      orderStatus: 'Confirmed'
    });

    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.purchaseCount += 1;

        if (!user.founderStatus) {
          const founderCount = await User.countDocuments({ founderStatus: true });
          if (founderCount < 50) {
            user.founderStatus = true;
          }
        }

        await checkMilestones(user);
      }
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminOrders, getMyOrders, createOrder, checkMilestones };
