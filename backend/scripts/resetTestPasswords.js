require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const newHashedPassword = await bcrypt.hash('password123', 12);

    const user1 = await User.findOneAndUpdate(
      { userId: 'URX-000000' },
      { password: newHashedPassword },
      { new: true }
    );
    if (user1) {
      console.log('✅ Password for URX-000000 (admin) updated to "password123".');
    } else {
      console.log('❌ User URX-000000 not found.');
    }

    const user2 = await User.findOneAndUpdate(
      { userId: 'URX-111111' },
      { password: newHashedPassword },
      { new: true }
    );
    if (user2) {
      console.log('✅ Password for URX-111111 (investor_pro) updated to "password123".');
    } else {
      console.log('❌ User URX-111111 not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

reset();
