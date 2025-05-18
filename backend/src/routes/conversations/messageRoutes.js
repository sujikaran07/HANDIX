const express = require('express');
const router = express.Router();
const Message = require('../../models/messageModel');
const Conversation = require('../../models/conversationModel');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

// Get all messages for a conversation
router.get('/conversation/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      order: [['sent_at', 'ASC']]
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
  }
});

// Send a new message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { conversation_id, sender_id, sender_role, message_text } = req.body;
    
    // Validate sender_role
    if (!['customer', 'artisan'].includes(sender_role)) {
      return res.status(400).json({ message: 'Invalid sender role. Must be "customer" or "artisan"' });
    }
    
    // Check if conversation exists
    const conversation = await Conversation.findByPk(conversation_id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Create new message
    const newMessage = await Message.create({
      conversation_id,
      sender_id,
      sender_role,
      message_text
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;
