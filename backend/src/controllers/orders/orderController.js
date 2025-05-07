const { Order } = require('../../models/orderModel');
const { OrderDetail } = require('../../models/orderDetailModel');
const { Customer } = require('../../models/customerModel');
const { Employee } = require('../../models/employeeModel');
const { Sequelize, Op } = require('sequelize');
const Inventory = require('../../models/inventoryModel');
const { sequelize } = require('../../config/db');
const { Address } = require('../../models/addressModel');
const ProductImage = require('../../models/productImageModel');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          attributes: ['c_id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          attributes: ['order_detail_id', 'order_id', 'product_id', 'quantity', 'priceAtPurchase']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { 
          model: Customer, 
          as: 'customerInfo',
          include: [{ model: Address, as: 'addresses' }]  // Include customer addresses
        },
        { model: OrderDetail, as: 'orderDetails' }
      ],
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Process the order data to include shipping fee and product images
    const orderData = order.toJSON();
    
    // Add default shipping fee if not present
    if (!orderData.shippingFee) {
      orderData.shippingFee = 350;
    }
    
    // Fetch product images for order details
    if (orderData.orderDetails && orderData.orderDetails.length > 0) {
      for (const detail of orderData.orderDetails) {
        try {
          // Get product image
          const productImage = await ProductImage.findOne({
            where: { product_id: detail.product_id }
          });
          
          if (productImage) {
            detail.product_image = productImage.image_url;
          }
        } catch (err) {
          console.error(`Failed to fetch image for product ${detail.product_id}`);
        }
      }
    }
    
    res.status(200).json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customerId, orderDetails, ...orderData } = req.body;
    
    let orderId;
    let isIdUnique = false;
    let attempts = 0;
    
    while (!isIdUnique && attempts < 10) {
      const num = Math.floor(Math.random() * 999) + 1;
      orderId = `O${num.toString().padStart(3, '0')}`;
      
      const existingOrder = await Order.findByPk(orderId);
      if (!existingOrder) {
        isIdUnique = true;
      }
      attempts++;
    }
    
    if (!isIdUnique) {
      const timestamp = new Date().getTime().toString().slice(-3);
      orderId = `O${timestamp}`;
    }
    
    const order = await Order.create({
      order_id: orderId,
      c_id: customerId,
      shippingMethodId: null,
      ...orderData
    }, { transaction });
    
    if (orderDetails && orderDetails.length > 0) {
      for (const detail of orderDetails) {
        await OrderDetail.create({
          order_id: order.order_id,
          product_id: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
          customization: detail.customization || null,
          customization_fee: detail.customizationFee || 0
        }, { transaction });
        
        const inventory = await Inventory.findOne({
          where: { product_id: detail.productId }
        });
        
        if (inventory) {
          if (inventory.stock_quantity < detail.quantity) {
            await transaction.rollback();
            return res.status(400).json({ 
              message: `Not enough inventory for product ID: ${detail.productId}` 
            });
          }
          
          await inventory.update({
            stock_quantity: inventory.stock_quantity - detail.quantity
          }, { transaction });
        }
      }
    }
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.order_id,
        date: order.orderDate,
        status: order.orderStatus
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

const updateOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, assignedArtisan } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const updatedOrder = await order.update({
      orderStatus: orderStatus || order.orderStatus,
      paymentStatus: paymentStatus || order.paymentStatus,
      assignedArtisan: assignedArtisan || order.assignedArtisan
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({ 
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.destroy({ where: { order_id: id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
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

const getCustomerOrders = async (req, res) => {
  try {
    // Get customer ID from query parameter or auth token
    const customerId = req.query.customerId || (req.user && req.user.id);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }
    
    console.log(`Fetching orders for customer ID: ${customerId}`);
    
    const orders = await Order.findAll({
      where: { c_id: customerId },
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          include: [{ model: Address, as: 'addresses' }]  // Include customer addresses
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          attributes: ['order_detail_id', 'order_id', 'product_id', 'quantity', 'priceAtPurchase']
        }
      ],
      order: [['orderDate', 'DESC']]
    });
    
    // Process orders to include product images
    const processedOrders = [];
    
    for (const order of orders) {
      const orderData = order.toJSON();
      
      // Add shipping fee if not set
      if (!orderData.shippingFee) {
        orderData.shippingFee = 350;
      }
      
      // Fetch product images for each order item
      if (orderData.orderDetails && orderData.orderDetails.length > 0) {
        for (const detail of orderData.orderDetails) {
          try {
            // Get product image
            const productImage = await ProductImage.findOne({
              where: { product_id: detail.product_id }
            });
            
            if (productImage) {
              detail.product_image = productImage.image_url;
            }
          } catch (err) {
            console.error(`Failed to fetch image for product ${detail.product_id}`);
          }
        }
      }
      
      processedOrders.push(orderData);
    }

    res.status(200).json({
      success: true,
      count: processedOrders.length,
      orders: processedOrders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getArtisansWithOrderInfo,
  getCustomerOrders // Add this to exports
};
