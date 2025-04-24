const { Order } = require('../../models/orderModel');
const { OrderDetail } = require('../../models/orderDetailModel');
const { Customer } = require('../../models/customerModel');
const { Employee } = require('../../models/employeeModel');
const { Sequelize, Op } = require('sequelize');

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

const getArtisansWithOrderInfo = async (req, res) => {
  try {
    console.log('Starting getArtisansWithOrderInfo function');
    
    let employees = [];
    try {
      employees = await Employee.findAll({
        attributes: ['eId', 'firstName', 'lastName']
      });
      console.log(`Found ${employees.length} total employees`);
    } catch (err) {
      console.error('Error querying employees:', err);
      return res.status(200).json([]); 
    }
    
    if (!employees || employees.length === 0) {
      console.log('No employees found');
      return res.status(200).json([]);
    }

    const artisansWithOrderInfo = await Promise.all(employees.map(async (employee) => {
      try {
        console.log(`Processing employee with ID: ${employee.eId}`);
        
        const ongoingRegularOrdersCount = await Order.count({
          where: {
            assignedArtisanId: employee.eId,
            isCustomized: false, 
            status: {
              [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled'] 
            }
          }
        });
        
        const ongoingCustomizedOrdersCount = await Order.count({
          where: {
            assignedArtisanId: employee.eId,
            isCustomized: true, 
            status: {
              [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled'] 
            }
          }
        });

        const totalOngoingOrdersCount = ongoingRegularOrdersCount + ongoingCustomizedOrdersCount;
        
        console.log(`Employee ${employee.eId} has ${totalOngoingOrdersCount} ongoing orders (${ongoingRegularOrdersCount} regular, ${ongoingCustomizedOrdersCount} customized)`);

        const lastCompletedOrder = await Order.findOne({
          where: {
            assignedArtisanId: employee.eId,
            status: 'Shipped' 
          },
          order: [['updatedAt', 'DESC']] 
        });

        let availability = 'Available';
        
        
        if (totalOngoingOrdersCount > 3 && ongoingCustomizedOrdersCount >= 2 && ongoingRegularOrdersCount >= 1) {
          availability = 'Busy';
        }
        else if (totalOngoingOrdersCount >= 5) {
          availability = 'Busy';
        }

        return {
          id: employee.eId,
          name: `${employee.firstName} ${employee.lastName}`,
          availability: availability,
          lastCompletedOrder: lastCompletedOrder ? lastCompletedOrder.updatedAt : 'N/A', 
          ongoingOrders: totalOngoingOrdersCount === 0 ? '0 Orders' : 
                         totalOngoingOrdersCount === 1 ? '1 Order' : 
                         `${totalOngoingOrdersCount} Orders`,
          expertise: 'Artisan',
          canAssign: availability === 'Available' 
        };
      } catch (err) {
        console.error(`Error processing employee ${employee.eId}:`, err);
        return {
          id: employee.eId,
          name: `${employee.firstName} ${employee.lastName}`,
          availability: 'Available',
          lastCompletedOrder: 'N/A',
          ongoingOrders: '0 Orders',
          expertise: 'Artisan',
          canAssign: true 
        };
      }
    }));

    console.log(`Returning ${artisansWithOrderInfo.length} artisans with order info`);
    res.status(200).json(Array.isArray(artisansWithOrderInfo) ? artisansWithOrderInfo : []);
    
  } catch (error) {
    console.error('Error in getArtisansWithOrderInfo:', error);
    res.status(200).json([]);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getArtisansWithOrderInfo
};
