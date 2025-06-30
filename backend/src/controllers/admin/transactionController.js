const { Transaction } = require('../../models/transactionModel');
const { Order } = require('../../models/orderModel');
const { Customer } = require('../../models/customerModel');

// Get all transactions with customer and order info
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['c_id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['order_id', 'orderStatus', 'totalAmount']
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

// Get transaction details by transaction ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      where: { transaction_id: id },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['c_id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['order_id', 'orderStatus', 'totalAmount']
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

// Process refund for a transaction and update order status
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

    // Update related order status to 'Refunded'
    const order = await Order.findOne({
      where: { order_id: transaction.order_id }
    });

    if (order) {
      await order.update({ 
        orderStatus: 'Refunded',
        updated_at: new Date()
      });
    }

    // Note: Actual payment gateway refund should be handled here

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