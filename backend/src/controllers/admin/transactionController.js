const { Transaction } = require('../../models/transactionModel');
const { Order } = require('../../models/orderModel');
const { Customer } = require('../../models/customerModel');

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Customer,
          attributes: ['c_id', 'name', 'email', 'phone']
        },
        {
          model: Order,
          attributes: ['order_id', 'order_status', 'total_price']
        }
      ],
      order: [['transactionDate', 'DESC']]
    });

    res.status(200).json({ 
      success: true, 
      transactions 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transactions', 
      error: error.message 
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findOne({
      where: { transaction_id: id },
      include: [
        {
          model: Customer,
          attributes: ['c_id', 'name', 'email', 'phone']
        },
        {
          model: Order,
          attributes: ['order_id', 'order_status', 'total_price', 'shipping_address']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      transaction 
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transaction details', 
      error: error.message 
    });
  }
};

// Process refund for a transaction
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the transaction to refund
    const transaction = await Transaction.findOne({
      where: { transaction_id: id }
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Only allow refunds for completed transactions
    if (transaction.transactionStatus !== 'Completed') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot refund a transaction with status: ${transaction.transactionStatus}` 
      });
    }

    // Update the transaction status to 'Refunded'
    await transaction.update({ 
      transactionStatus: 'Refunded',
      notes: transaction.notes 
        ? `${transaction.notes}\nRefunded on ${new Date().toISOString()}` 
        : `Refunded on ${new Date().toISOString()}`
    });

    // Find the related order and update its status if needed
    const order = await Order.findOne({
      where: { order_id: transaction.order_id }
    });

    if (order) {
      await order.update({ 
        order_status: 'Refunded',
        updated_at: new Date()
      });
    }

    // In a real application, you would also handle the actual money refund through
    // a payment gateway here (Stripe, PayPal, etc.)

    res.status(200).json({ 
      success: true, 
      message: 'Transaction refunded successfully',
      transaction: {
        transaction_id: transaction.transaction_id,
        transactionStatus: 'Refunded'
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process refund', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  processRefund
}; 