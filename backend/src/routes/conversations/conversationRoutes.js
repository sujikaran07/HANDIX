const express = require('express');
const router = express.Router();
const Conversation = require('../../models/conversationModel');
const Message = require('../../models/messageModel');
const { Customer } = require('../../models/customerModel');
const { Employee } = require('../../models/employeeModel');
const { Order } = require('../../models/orderModel');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

// Get conversations by order ID
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const conversation = await Conversation.findOne({
      where: { order_id: orderId },
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer', attributes: ['c_id', 'first_name', 'last_name'] },
        { model: Employee, as: 'artisan', attributes: ['e_id', 'first_name', 'last_name'] }
      ]
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'No conversation found for this order' });
    }
    
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error fetching conversation by order ID:', error);
    res.status(500).json({ message: 'Failed to retrieve conversation', error: error.message });
  }
});

// Get all conversations for a customer
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const conversations = await Conversation.findAll({
      where: { customer_id: customerId },
      include: [
        { model: Order, as: 'order' },
        { model: Employee, as: 'artisan', attributes: ['e_id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching customer conversations:', error);
    res.status(500).json({ message: 'Failed to retrieve conversations', error: error.message });
  }
});

// Get all conversations for an artisan
router.get('/artisan/:artisanId', authMiddleware, async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    const conversations = await Conversation.findAll({
      where: { artisan_id: artisanId },
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer', attributes: ['c_id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching artisan conversations:', error);
    res.status(500).json({ message: 'Failed to retrieve conversations', error: error.message });
  }
});

// Get a specific conversation by ID with messages
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer', attributes: ['c_id', 'first_name', 'last_name'] },
        { model: Employee, as: 'artisan', attributes: ['e_id', 'first_name', 'last_name'] },
        { 
          model: Message, 
          as: 'conversationMessages',
          order: [['sent_at', 'ASC']] 
        }
      ]
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Failed to retrieve conversation', error: error.message });
  }
});

// Create a new conversation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { order_id, customer_id, artisan_id } = req.body;
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      where: { order_id, customer_id, artisan_id }
    });
    
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }
    
    // Create new conversation
    const newConversation = await Conversation.create({
      order_id,
      customer_id,
      artisan_id
    });
    
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Failed to create conversation', error: error.message });
  }
});

module.exports = router;
