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
          attributes: ['order_detail_id', 'order_id', 'product_id', 'quantity', 'priceAtPurchase', 'customization', 'customization_fee']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    // Process orders to include complete details
    const processedOrders = await Promise.all(orders.map(async (order) => {
      const orderData = order.toJSON();
      
      // Default shipping fee if not set
      if (!orderData.shippingFee) {
        orderData.shippingFee = 350;
      }

      // Format order items with product details and images
      if (orderData.orderDetails && orderData.orderDetails.length > 0) {
        const itemsWithDetails = await Promise.all(orderData.orderDetails.map(async (detail) => {
          try {
            // Get product image
            const productImage = await ProductImage.findOne({
              where: { product_id: detail.product_id }
            });
            
            // Get product details
            const inventory = await Inventory.findOne({
              where: { product_id: detail.product_id }
            });
            
            return {
              product_id: detail.product_id,
              product_name: inventory?.product_name || 'Unknown Product',
              quantity: detail.quantity,
              unit_price: detail.priceAtPurchase,
              image_url: productImage?.image_url || null,
              customizations: detail.customization,
              customization_fee: detail.customization_fee
            };
          } catch (err) {
            console.error(`Failed to fetch details for product ${detail.product_id}:`, err);
            return {
              product_id: detail.product_id,
              product_name: 'Unknown Product',
              quantity: detail.quantity,
              unit_price: detail.priceAtPurchase,
              image_url: null
            };
          }
        }));
        
        // Add items array to order
        orderData.items = itemsWithDetails;
        
        // Calculate additional fields
        orderData.subtotal = itemsWithDetails.reduce(
          (sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.quantity)), 
          0
        );
        
        orderData.additionalFees = itemsWithDetails.reduce(
          (sum, item) => sum + (parseFloat(item.customization_fee || 0)), 
          0
        );
      }
      
      // Format customer information
      if (orderData.customerInfo) {
        orderData.customerName = `${orderData.customerInfo.firstName || ''} ${orderData.customerInfo.lastName || ''}`.trim();
        orderData.customerEmail = orderData.customerInfo.email;
        orderData.customerPhone = orderData.customerInfo.phone;
        orderData.customer_id = orderData.customerInfo.c_id;
      }
      
      return orderData;
    }));

    res.status(200).json({
      success: true,
      count: processedOrders.length,
      orders: processedOrders
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
          include: [{ model: Address, as: 'addresses' }]  
        },
        { model: OrderDetail, as: 'orderDetails' }
      ],
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const orderData = order.toJSON();
    
    if (!orderData.shippingFee) {
      orderData.shippingFee = 350;
    }
    
    if (orderData.orderDetails && orderData.orderDetails.length > 0) {
      for (const detail of orderData.orderDetails) {
        try {
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
    const { orderStatus, paymentStatus, assignedArtisan, assignedArtisanId } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If this is a customized order and we're assigning an artisan for the first time,
    // automatically set the status to "Review"
    let newStatus = orderStatus || order.orderStatus;
    
    if (order.customized === 'Yes' && !order.assignedArtisan && assignedArtisan) {
      newStatus = 'Review';
    }
    
    const updatedOrder = await order.update({
      orderStatus: newStatus,
      paymentStatus: paymentStatus || order.paymentStatus,
      assignedArtisan: assignedArtisan || order.assignedArtisan,
      assignedArtisanId: assignedArtisanId || order.assignedArtisanId
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
        attributes: ['eId', 'firstName', 'lastName', 'roleId'],
        where: {
          roleId: 2  // Assuming roleId 2 is for Artisans, roleId 1 is for Admin
        }
      });
      console.log(`Found ${employees.length} total artisans`);
    } catch (err) {
      console.error('Error querying employees:', err);
      return res.status(200).json([]); 
    }
    
    if (!employees || employees.length === 0) {
      console.log('No artisans found');
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
          include: [{ model: Address, as: 'addresses' }]  
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          attributes: ['order_detail_id', 'order_id', 'product_id', 'quantity', 'priceAtPurchase']
        }
      ],
      order: [['orderDate', 'DESC']]
    });
    const processedOrders = [];
    
    for (const order of orders) {
      const orderData = order.toJSON();
      
      if (!orderData.shippingFee) {
        orderData.shippingFee = 350;
      }
      if (orderData.orderDetails && orderData.orderDetails.length > 0) {
        for (const detail of orderData.orderDetails) {
          try {

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

const confirmOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        { 
          model: Customer, 
          as: 'customerInfo',
        },
        { model: OrderDetail, as: 'orderDetails' }
      ],
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order is in a state that can be confirmed
    if (!['Pending', 'To Pay', 'Awaiting Payment'].includes(order.orderStatus)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Order cannot be confirmed. Only pending or awaiting payment orders can be confirmed.' 
      });
    }
    
    // Update the order status
    await order.update({
      orderStatus: 'Processing',
      paymentStatus: 'Confirmed'
    }, { transaction });
    
    // Send a simple confirmation email instead of invoice
    if (order.customerInfo?.email) {
      const nodemailer = require('nodemailer');
      
      // Create transporter with email configuration from .env
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Send simple confirmation email
      transporter.sendMail({
        from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
        to: order.customerInfo.email,
        subject: `Your Handix Crafts Order #${order.order_id} is now Processing`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #0c4a6e; text-align: center;">Order Confirmation</h2>
            <p>Dear ${order.customerInfo.firstName || 'Valued Customer'},</p>
            <p>We're pleased to inform you that your order <strong>#${order.order_id}</strong> has been confirmed and is now being processed.</p>
            <p>Our team will start working on your order right away. You'll receive another email when your order has been shipped.</p>
            <p>Thank you for shopping with Handix Crafts!</p>
            <div style="background-color: #f5f5f5; padding: 15px; margin-top: 20px; text-align: center;">
              <p style="margin: 0;">Handix Crafts</p>
              <p style="margin: 5px 0;">Phone: +94 77-63 60319</p>
              <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        `
      })
      .then(result => {
        console.log('Order confirmation email sent:', result.messageId);
      })
      .catch(err => {
        console.error('Error sending order confirmation email:', err);
      });
    }
    
    await transaction.commit();
    
    res.status(200).json({ 
      message: 'Order confirmed successfully',
      order: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error confirming order:', error);
    res.status(500).json({ message: 'Error confirming order', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    
    const order = await Order.findByPk(id, {
      include: [
        { 
          model: Customer, 
          as: 'customerInfo',
        },
        { model: OrderDetail, as: 'orderDetails' }
      ],
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order is in a state that can be cancelled
    if (['Delivered', 'Canceled', 'Cancelled'].includes(order.orderStatus)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Order cannot be cancelled. Order is already delivered or cancelled.' 
      });
    }
    
    // Update the order status
    await order.update({
      orderStatus: 'Cancelled',
      cancellationReason: cancellationReason || 'Cancelled by admin'
    }, { transaction });
    
    // If products were allocated, return them to inventory
    if (order.orderDetails && order.orderDetails.length > 0) {
      for (const detail of order.orderDetails) {
        const inventory = await Inventory.findOne({
          where: { product_id: detail.product_id },
          transaction
        });
        
        if (inventory) {
          // Return items to stock
          await inventory.update({
            stock_quantity: inventory.stock_quantity + detail.quantity
          }, { transaction });
        }
      }
    }
    
    // Get email service
    const nodemailer = require('nodemailer');
    
    // Create transporter with email configuration from .env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Send cancellation email in background
    if (order.customerInfo?.email) {
      transporter.sendMail({
        from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
        to: order.customerInfo.email,
        subject: `Your Handix Crafts Order #${order.order_id} has been cancelled`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #0c4a6e; text-align: center;">Order Cancellation Notice</h2>
            <p>Dear ${order.customerName || 'Valued Customer'},</p>
            <p>We regret to inform you that your order #${order.order_id} has been cancelled.</p>
            <p><strong>Reason:</strong> ${cancellationReason || 'Administrative action'}</p>
            <p>If you have any questions about this cancellation, please contact our customer service.</p>
            <div style="background-color: #f5f5f5; padding: 15px; margin-top: 20px; text-align: center;">
              <p style="margin: 0;">Handix Crafts</p>
              <p style="margin: 5px 0;">Phone: +94 77-63 60319</p>
              <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        `
      })
        .then(result => {
          console.log('Order cancellation email sent:', result.messageId);
        })
        .catch(err => {
          console.error('Error sending order cancellation email:', err);
        });
    }
    
    await transaction.commit();
    
    res.status(200).json({ 
      message: 'Order cancelled successfully',
      order: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

const getAssignableOrders = async (req, res) => {
  try {
    // Modified to only fetch Pending orders (not Processing)
    const assignableOrders = await Order.findAll({
      where: {
        orderStatus: 'Pending', // Changed to only fetch Pending orders
        [Op.and]: [
          {
            [Op.or]: [
              { assignedArtisan: null },
              { assignedArtisan: '' }
            ]
          }
        ]
      },
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          attributes: ['firstName', 'lastName']
        }
      ],
      attributes: ['order_id', 'orderStatus', 'customized', 'orderDate', 'totalAmount'],
      order: [['orderDate', 'DESC']]
    });

    // Process and format orders for the frontend with consistent customized field
    const formattedOrders = assignableOrders.map(order => {
      const orderData = order.toJSON();
      
      // Format customer name
      let customerName = 'Unknown';
      if (orderData.customerInfo) {
        if (orderData.customerInfo.firstName && orderData.customerInfo.lastName) {
          customerName = `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`;
        } else if (orderData.customerInfo.firstName) {
          customerName = orderData.customerInfo.firstName;
        }
      }
      
      // Normalize the customized field to ensure consistent boolean values
      const isCustomized = orderData.customized === 'Yes' || 
                          orderData.customized === 'yes' || 
                          orderData.customized === true || 
                          orderData.customized === 'true';

      return {
        id: orderData.order_id,
        status: orderData.orderStatus || 'Pending',
        customized: isCustomized, // Send as boolean for consistency
        customerName,
        orderDate: orderData.orderDate,
        totalAmount: orderData.totalAmount || 0
      };
    });

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching assignable orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignable orders',
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
  getCustomerOrders,
  confirmOrder,
  cancelOrder,
  getAssignableOrders  // Add this line to export the function
};
