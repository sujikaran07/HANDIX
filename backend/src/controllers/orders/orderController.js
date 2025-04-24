const { Order } = require('../../models/orderModel');
const { OrderDetail } = require('../../models/orderDetailModel');
const { Customer } = require('../../models/customerModel');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Customer, as: 'customer' }, 
        { model: OrderDetail, as: 'orderDetails' }
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: OrderDetail, as: 'orderDetails' }
      ],
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { customerId, orderDetails, ...orderData } = req.body;
    const order = await Order.create({ ...orderData, customerId });
    if (orderDetails && orderDetails.length > 0) {
      const details = orderDetails.map((detail) => ({
        ...detail,
        orderId: order.id,
      }));
      await OrderDetail.bulkCreate(details);
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Order.update(req.body, { where: { id } });
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
