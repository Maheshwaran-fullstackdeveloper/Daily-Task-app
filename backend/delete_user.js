const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const deleteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daily_tasks');
        console.log('Connected to MongoDB');

        const result = await User.deleteOne({ username: 'admin' });
        console.log(`Deleted ${result.deletedCount} user(s)`);
    } catch (error) {
        console.error('Error deleting user:', error);
    } finally {
        await mongoose.disconnect();
    }
};

deleteUser();
