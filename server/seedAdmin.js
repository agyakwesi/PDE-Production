const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'agyakwesiadom@gmail.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: 'Agya Kwesi Adom',
        email: email,
        password: 'hashed_placeholder_pwd_until_auth',
        role: 'admin'
      });
      await user.save();
      console.log('Created new user and granted admin privileges!');
    } else {
      user.role = 'admin';
      await user.save();
      console.log('Updated existing user to admin!');
    }

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
