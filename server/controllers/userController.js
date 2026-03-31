const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user (authenticated)
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleFounderStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.founderStatus = !user.founderStatus;
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addExternalScent = async (req, res) => {
  try {
    const { name, brand, category } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.externalCollection.push({ name, brand, category });
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeExternalScent = async (req, res) => {
  try {
    const { scentId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.externalCollection = user.externalCollection.filter(s => s._id.toString() !== scentId);
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, getCurrentUser, toggleFounderStatus, addExternalScent, removeExternalScent };
