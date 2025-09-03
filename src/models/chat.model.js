
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    index: true
  },
  messages: [messageSchema],
}, { timestamps: true });

// Add indexes for better performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1, createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
module.exports = Chat;
