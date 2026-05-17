const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daily_tasks');
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: 'admin' });
        if (!user) {
            console.log('User not found. Creating admin user...');
            await User.create({ username: 'admin', password: '1234' });
            console.log('Admin user created with password: 1234');
        } else {
            user.password = '1234';
            await user.save();
            console.log('Password reset to: 1234');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await mongoose.disconnect();
    }
};

resetPassword();
