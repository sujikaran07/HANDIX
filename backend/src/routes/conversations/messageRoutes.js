const express = require('express');
const router = express.Router();
const Message = require('../../models/messageModel');
const Conversation = require('../../models/conversationModel');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');
const Attachment = require('../../models/attachmentModel');
const { upload } = require('../../utils/cloudinaryConfig');

// Route: Get all messages for a conversation, including attachments
router.get('/conversation/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      order: [['sent_at', 'ASC']],
      raw: true,
    });
    // Fetch attachments for all messages
    const messageIds = messages.map(m => m.message_id);
    let attachments = [];
    if (messageIds.length > 0) {
      attachments = await Attachment.findAll({
        where: { message_id: messageIds },
        raw: true,
      });
    }
    // Attach attachments to their messages
    const messagesWithAttachments = messages.map(msg => ({
      ...msg,
      attachments: attachments.filter(att => att.message_id === msg.message_id),
    }));
    res.status(200).json(messagesWithAttachments);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
  }
});

// Route: Send a new message with optional attachments
router.post('/', authMiddleware, upload.array('attachments', 5), async (req, res) => {
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
    
    // Handle attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Cloudinary URL is in file.path (multer-storage-cloudinary)
        const attachment = await Attachment.create({
          message_id: newMessage.message_id,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
        });
        attachments.push({
          attachment_id: attachment.attachment_id,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
        });
      }
    }
    res.status(201).json({ ...newMessage.toJSON(), attachments });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;
