const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mock authenticated current user
const getCurrentUser = async (req, res) => {
  try {
    let user = await User.findOne().select('-password');
    if (!user) {
      user = {
        name: 'Guest Curator',
        role: 'user',
        email: 'guest@parfumelite.com',
        createdAt: new Date()
      };
    }
    
    // Supplement with static membership data just for the Vault display requirement
    const enrichedUser = {
      ...user._doc || user,
      memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      membershipTier: "L'Architecte Fondateur",
      privilegeCode: "ELITE-FNDR-001",
      acquisitions: 0,
      rewardPoints: 0
    };

    res.status(200).json(enrichedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, getCurrentUser };
