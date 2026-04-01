const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);
    process.exit(0);
  } catch(e) {
    console.error('Error resetting users:', e);
    process.exit(1);
  }
}

reset();
