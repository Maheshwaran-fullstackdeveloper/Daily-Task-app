const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['common', 'scheduled'],
        required: true
    },
    scheduledDate: {
        type: String, // Store as YYYY-MM-DD for easier comparison
        required: function() { return this.category === 'scheduled'; }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
