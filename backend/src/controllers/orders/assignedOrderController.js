const { Order } = require('../../models/orderModel');
const { Customer } = require('../../models/customerModel');
const { OrderDetail } = require('../../models/orderDetailModel');
const { Sequelize, Op } = require('sequelize');
const Inventory = require('../../models/inventoryModel');
const ProductImage = require('../../models/productImageModel');

// Get orders assigned to a specific artisan
const getAssignedOrders = async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId) {
      return res.status(400).json({ error: 'Artisan ID is required' });
    }

    console.log(`Fetching orders for artisan: ${artisanId}`);

    // Try an even more flexible search approach by using lower case comparison
    // We'll first normalize the artisanId by replacing spaces with % for more flexible matching
    const normalizedArtisanId = artisanId.toLowerCase().replace(/\s+/g, '%');
    
    console.log(`Using normalized search pattern: %${normalizedArtisanId}%`);

    // Get all orders to see what we're working with
    const allAssignedOrders = await Order.findAll({
      attributes: ['order_id', 'assignedArtisan'],
      where: {
        assignedArtisan: {
          [Op.not]: null
        }
      }
    });
    
    console.log(`Found ${allAssignedOrders.length} orders with assigned artisans in the system`);
    allAssignedOrders.forEach(order => {
      console.log(`Order: ${order.order_id}, Assigned to: "${order.assignedArtisan}"`);
    });

    // Now let's find the orders that match our artisan using raw SQL for case-insensitive matching
    const orders = await Order.findAll({
      where: Sequelize.literal(`LOWER(assigned_artisan) LIKE LOWER('%${artisanId}%')`),
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          attributes: ['c_id', 'firstName', 'lastName', 'email']
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          attributes: ['order_detail_id', 'product_id', 'quantity']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    console.log(`Found ${orders.length} orders assigned to artisan using case-insensitive search`);
    
    // Also try with split name parts for more flexibility
    let nameParts = artisanId.toLowerCase().split(' ');
    console.log(`Name parts for searching: ${nameParts.join(', ')}`);
    
    // If we didn't find any orders with the full name, try individual name parts
    if (orders.length === 0 && nameParts.length > 1) {
      console.log('Trying alternate search with name parts...');
      
      const namePartConditions = nameParts.map(part => ({
        assignedArtisan: {
          [Op.iLike]: `%${part}%`
        }
      }));
      
      const altOrders = await Order.findAll({
        where: {
          [Op.or]: namePartConditions
        },
        include: [
          {
            model: Customer,
            as: 'customerInfo',
            attributes: ['c_id', 'firstName', 'lastName', 'email']
          },
          {
            model: OrderDetail,
            as: 'orderDetails',
            attributes: ['order_detail_id', 'product_id', 'quantity']
          }
        ],
        order: [['orderDate', 'DESC']]
      });
      
      console.log(`Found ${altOrders.length} orders with name part matching`);
      
      if (altOrders.length > 0 && orders.length === 0) {
        // Use these orders instead if we found some
        orders.push(...altOrders);
      }
    }

    // Format the orders to include product details from order details
    const formattedOrders = await Promise.all(orders.map(async order => {
      const orderDetails = order.orderDetails && order.orderDetails.length > 0 ? order.orderDetails[0] : null;
      const customer = order.customerInfo;
      
      let productName = 'Unknown Product';
      if (orderDetails && orderDetails.product_id) {
        try {
          const inventory = await Inventory.findOne({
            where: { product_id: orderDetails.product_id }
          });
          if (inventory) {
            productName = inventory.product_name;
          }
        } catch (error) {
          console.error(`Error fetching product details for ${orderDetails.product_id}:`, error);
        }
      }
      
      // Format customized value to "Yes" or "No" with first letter capitalized
      let formattedCustomized = "No";
      if (order.customized && (order.customized.toLowerCase() === 'yes' || order.customized === true || order.customized === 'true')) {
        formattedCustomized = "Yes";
      }
      
      return {
        o_id: order.order_id, // Renamed from order_id to o_id
        customer_first_name: customer ? customer.firstName : 'Unknown', // Only showing first name
        customer_email: customer ? customer.email : null,
        customized: formattedCustomized, // Formatted as "Yes" or "No"
        // quantity removed
        status: order.orderStatus,
        order_date: order.orderDate, // Renamed from assigned_date to order_date
        // due_date removed
        total_amount: order.totalAmount, // Added Total Amount field
        payment_status: order.paymentStatus,
        assigned_artisan: order.assignedArtisan
      };
    }));

    return res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update the status of an order
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes, deliveryStartDate, deliveryEndDate } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          attributes: ['c_id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the status change is valid
    const validStatusTransitions = {
      'Pending': ['In Production', 'Cancelled'],
      'In Production': ['Completed', 'Cancelled'],
      'Completed': ['Shipped', 'Delivered'],
      'Shipped': ['Delivered']
      // Delivered and Cancelled are terminal states
    };

    const currentStatus = order.orderStatus;
    
    if (currentStatus !== status && 
        currentStatus !== 'Delivered' && 
        currentStatus !== 'Cancelled' && 
        (!validStatusTransitions[currentStatus] || !validStatusTransitions[currentStatus].includes(status))) {
      return res.status(400).json({
        error: `Cannot change order status from ${currentStatus} to ${status}`
      });
    }

    // Update the order with the new status and delivery dates
    await order.update({
      orderStatus: status,
      notes: notes || order.notes,
      deliveryStartDate: deliveryStartDate || order.deliveryStartDate,
      deliveryEndDate: deliveryEndDate || order.deliveryEndDate
    });

    // Send email notification to customer if status changes to important states
    if (order.customerInfo?.email && 
        ['Completed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      
      try {
        // This would be implemented with your email service, 
        // like the example below using nodemailer
        const nodemailer = require('nodemailer');
        
        // Configure transporter
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
        
        // Customize email based on status
        let subject = '';
        let statusMessage = '';
        
        switch(status) {
          case 'Completed':
            subject = `Your Handix Crafts Order #${order.order_id} is ready!`;
            statusMessage = 'Your order has been completed and is ready to be shipped.';
            break;
          case 'Shipped':
            subject = `Your Handix Crafts Order #${order.order_id} has been shipped!`;
            statusMessage = 'Your order is on its way to you!';
            break;
          case 'Delivered':
            subject = `Your Handix Crafts Order #${order.order_id} has been delivered!`;
            statusMessage = 'Your order has been delivered. We hope you enjoy your purchase!';
            break;
          case 'Cancelled':
            subject = `Your Handix Crafts Order #${order.order_id} has been cancelled`;
            statusMessage = 'Your order has been cancelled.';
            break;
        }
        
        // Send the email
        transporter.sendMail({
          from: `"Handix Crafts" <${process.env.EMAIL_USER}>`,
          to: order.customerInfo.email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0c4a6e;">Order Status Update</h2>
              <p>Dear ${order.customerInfo.firstName || 'Valued Customer'},</p>
              <p>${statusMessage}</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; margin-top: 20px;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> ${order.order_id}</p>
                <p><strong>Status:</strong> ${status}</p>
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                ${deliveryStartDate && deliveryEndDate ? 
                  `<p><strong>Estimated Delivery:</strong> ${new Date(deliveryStartDate).toLocaleDateString()} - ${new Date(deliveryEndDate).toLocaleDateString()}</p>` 
                  : ''}
              </div>
              
              <p>If you have any questions about your order, please contact us.</p>
              <p>Thank you for shopping with Handix Crafts!</p>
            </div>
          `
        }).then(info => {
          console.log(`Email sent to customer for order ${order.order_id}: ${info.messageId}`);
        }).catch(err => {
          console.error(`Error sending status update email: ${err}`);
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }
    
    return res.status(200).json({ 
      message: 'Order status updated successfully',
      order: {
        order_id: order.order_id,
        status: order.orderStatus,
        updated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get details of a specific order
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          attributes: ['c_id', 'firstName', 'lastName', 'email'] 
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          attributes: ['order_detail_id', 'product_id', 'quantity', 'priceAtPurchase', 'customization']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format the response
    const orderDetails = order.orderDetails && order.orderDetails.length > 0 
      ? order.orderDetails[0] 
      : null;
    
    const customer = order.customerInfo;

    let productName = 'Unknown Product';
    if (orderDetails && orderDetails.product_id) {
      try {
        const inventory = await Inventory.findOne({
          where: { product_id: orderDetails.product_id }
        });
        if (inventory) {
          productName = inventory.product_name;
        }
      } catch (error) {
        console.error(`Error fetching product details for ${orderDetails.product_id}:`, error);
      }
    }
    
    const formattedOrder = {
      order_id: order.order_id,
      customer_id: order.c_id,
      customer_name: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Unknown',
      customer_email: customer ? customer.email : null,
      product_id: orderDetails ? orderDetails.product_id : null,
      product_name: productName,
      quantity: orderDetails ? orderDetails.quantity : 0,
      unit_price: orderDetails ? orderDetails.priceAtPurchase : 0,
      total_amount: order.totalAmount,
      status: order.orderStatus,
      payment_status: order.paymentStatus,
      assigned_date: order.orderDate,
      due_date: order.deliveryDate,
      customized: order.customized,
      special_instructions: orderDetails ? orderDetails.customization : null,
      assigned_to: order.assignedArtisan,
      shippingFee: order.shippingFee || 350, // Set default shipping fee if not present
      shipping_fee: order.shippingFee || 350, // Include alternative name for compatibility
      shippingCost: order.shippingCost || 350, // Include another alternative name
    };

    return res.status(200).json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get order items for a specific order
const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log(`Fetching order items for order ID: ${orderId}`);
    
    // Find all order details for this order
    const orderDetails = await OrderDetail.findAll({
      where: { order_id: orderId }
    });
    
    if (!orderDetails || orderDetails.length === 0) {
      console.log(`No items found for order ID: ${orderId}`);
      return res.status(200).json([]);
    }
    
    console.log(`Found ${orderDetails.length} items for order ID: ${orderId}`);
    
    // Process order details to include product information and images
    const processedItems = await Promise.all(orderDetails.map(async (detail) => {
      try {
        // Get product details from inventory
        const inventory = await Inventory.findOne({
          where: { product_id: detail.product_id }
        });
        
        // Get product image
        const productImage = await ProductImage.findOne({
          where: { product_id: detail.product_id }
        });
        
        return {
          product_id: detail.product_id,
          product_name: inventory?.product_name || 'Unknown Product',
          quantity: detail.quantity,
          unit_price: detail.priceAtPurchase,
          customizations: detail.customization || null,
          customization_fee: detail.customization_fee || 0,
          image_url: productImage?.image_url || null
        };
      } catch (err) {
        console.error(`Error fetching details for product ${detail.product_id}:`, err);
        return {
          product_id: detail.product_id,
          product_name: 'Unknown Product',
          quantity: detail.quantity,
          unit_price: detail.priceAtPurchase || 0
        };
      }
    }));
    
    res.status(200).json(processedItems);
    
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Error fetching order items', error: error.message });
  }
};

// Export the controller functions
module.exports = {
  getAssignedOrders,
  updateOrderStatus,
  getOrderDetails,
  getOrderItems
};
