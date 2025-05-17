const { Employee } = require('../../models/employeeModel');
const { Order } = require('../../models/orderModel');
const { Customer } = require('../../models/customerModel');
const { Sequelize, Op } = require('sequelize');

// Get all artisans (employees with roleId = 2)
const getAllArtisans = async (req, res) => {
  try {
    console.log('Fetching all artisans with role = 2');
    
    // Find employees with role ID 2 (Artisan)
    const artisans = await Employee.findAll({
      where: {
        roleId: 2  // Correct roleId for Artisan
      },
      attributes: ['eId', 'firstName', 'lastName', 'email', 'phone']
    });
    
    console.log(`Found ${artisans.length} artisans`);
    
    // For each artisan, get their order info
    const artisansWithOrderInfo = await Promise.all(artisans.map(async (artisan) => {
      try {
        console.log(`Processing artisan ${artisan.eId}`);
        
        // Create the full name to query orders
        const artisanFullName = `${artisan.firstName} ${artisan.lastName}`;
        
        // Add debug to check the exact field name being used
        console.log(`Looking for orders with assigned_artisan or assignedArtisan = "${artisanFullName}"`);
        
        // Try to query using possible field name variations to determine the correct one
        let ongoingOrders = 0;
        
        // Check all possible field name variations
        try {
          // First try assigned_artisan
          ongoingOrders = await Order.count({
            where: {
              assigned_artisan: artisanFullName,
              order_status: {
                [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled']
              }
            }
          });
          console.log(`Found ${ongoingOrders} orders using field 'assigned_artisan'`);
          
          // If we got 0 orders, try assignedArtisan
          if (ongoingOrders === 0) {
            const alternateQuery = await Order.count({
              where: {
                assignedArtisan: artisanFullName,
                orderStatus: {  // Also try orderStatus instead of order_status
                  [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled']
                }
              }
            });
            console.log(`Found ${alternateQuery} orders using field 'assignedArtisan'`);
            
            // Use the result from the field that returned orders
            if (alternateQuery > 0) {
              ongoingOrders = alternateQuery;
              console.log('Using assignedArtisan field instead of assigned_artisan');
            }
          }
        } catch (err) {
          console.error('Error querying ongoing orders:', err);
        }
        
        // Same approach for customized orders
        let customizedOrders = 0;
        
        // Try all field name combinations for customized orders
        try {
          // First attempt with assigned_artisan and customized
          customizedOrders = await Order.count({
            where: {
              assigned_artisan: artisanFullName,
              customized: {
                [Op.or]: ['Yes', 'yes', true, 'true']
              },
              order_status: {
                [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled']
              }
            }
          });
          
          // If nothing found, try with assignedArtisan
          if (customizedOrders === 0) {
            const alternateQuery = await Order.count({
              where: {
                assignedArtisan: artisanFullName,
                customized: {
                  [Op.or]: ['Yes', 'yes', true, 'true']
                },
                orderStatus: {
                  [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled']
                }
              }
            });
            
            if (alternateQuery > 0) {
              customizedOrders = alternateQuery;
            }
          }
        } catch (err) {
          console.error('Error querying customized orders:', err);
        }

        // Calculate regular orders
        const regularOrders = ongoingOrders - customizedOrders;
        
        // Get last completed order - try both field name variants
        let lastCompletedOrder = null;
        try {
          lastCompletedOrder = await Order.findOne({
            where: {
              assigned_artisan: artisanFullName,
              order_status: {
                [Op.in]: ['Shipped', 'Delivered']
              }
            },
            order: [['order_date', 'DESC']],
            limit: 1
          });
          
          if (!lastCompletedOrder) {
            lastCompletedOrder = await Order.findOne({
              where: {
                assignedArtisan: artisanFullName,
                orderStatus: {
                  [Op.in]: ['Shipped', 'Delivered']
                }
              },
              order: [['orderDate', 'DESC']],
              limit: 1
            });
          }
        } catch (err) {
          console.error('Error querying last completed order:', err);
        }

        // Determine availability status
        let availability = 'Available';
        if (ongoingOrders > 5 || (customizedOrders > 2 && regularOrders >= 1)) {
          availability = 'Busy';
        }
        
        console.log(`Artisan ${artisan.eId} (${artisanFullName}): ${ongoingOrders} ongoing orders, ${customizedOrders} customized, availability: ${availability}`);
        
        // Format response with action permissions for UI
        return {
          id: artisan.eId,
          name: `${artisan.firstName} ${artisan.lastName}`,
          email: artisan.email,
          phone: artisan.phone,
          ongoingOrders: ongoingOrders === 0 ? '0 Orders' : 
                        ongoingOrders === 1 ? '1 Order' : 
                        `${ongoingOrders} Orders`,
          lastCompletedOrder: lastCompletedOrder ? (lastCompletedOrder.orderDate || lastCompletedOrder.order_date) : null,
          availability: availability,
          canAssign: availability === 'Available',
          actions: {
            viewDetails: true,  // Always allow viewing details
            assignOrder: availability === 'Available' // Only allow assigning if available
          }
        };
      } catch (err) {
        console.error(`Error processing artisan ${artisan.eId}:`, err);
        return {
          id: artisan.eId,
          name: `${artisan.firstName} ${artisan.lastName}`,
          email: artisan.email,
          phone: artisan.phone,
          ongoingOrders: '0 Orders',
          lastCompletedOrder: null,
          availability: 'Available',
          canAssign: true
        };
      }
    }));
    
    console.log('Returning artisans with order info');
    res.status(200).json(artisansWithOrderInfo);
  } catch (error) {
    console.error('Error fetching artisans:', error);
    res.status(500).json({
      message: 'Error fetching artisans',
      error: error.message
    });
  }
};

// Get a specific artisan by ID
const getArtisanById = async (req, res) => {
  try {
    const { id } = req.params;
    const artisan = await Employee.findByPk(id, {
      attributes: ['eId', 'firstName', 'lastName', 'email', 'phone']
    });
    
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    
    res.status(200).json({
      id: artisan.eId,
      name: `${artisan.firstName} ${artisan.lastName}`,
      email: artisan.email,
      phone: artisan.phone
    });
  } catch (error) {
    console.error('Error fetching artisan:', error);
    res.status(500).json({
      message: 'Error fetching artisan details',
      error: error.message
    });
  }
};

// Get detailed workload information for a specific artisan
const getArtisanWorkload = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if artisan exists
    const artisan = await Employee.findByPk(id);
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    
    // Create the full name to query orders
    const artisanFullName = `${artisan.firstName} ${artisan.lastName}`;
    console.log(`Looking for workload orders with artisan name = "${artisanFullName}"`);
    
    // Try both field name variants for ongoing orders
    let ongoingOrders = [];
    try {
      ongoingOrders = await Order.findAll({
        where: {
          assigned_artisan: artisanFullName,
          order_status: {
            [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled']
          }
        },
        include: [
          {
            model: Customer,
            as: 'customerInfo',
            attributes: ['firstName', 'lastName']
          }
        ]
      });
      
      console.log(`Found ${ongoingOrders.length} orders using assigned_artisan`);
      
      // If no orders found, try alternative field name
      if (ongoingOrders.length === 0) {
        const alternateOrders = await Order.findAll({
          where: {
            assignedArtisan: artisanFullName,
            orderStatus: {
              [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled']
            }
          },
          include: [
            {
              model: Customer,
              as: 'customerInfo',
              attributes: ['firstName', 'lastName']
            }
          ]
        });
        
        console.log(`Found ${alternateOrders.length} orders using assignedArtisan`);
        
        if (alternateOrders.length > 0) {
          ongoingOrders = alternateOrders;
        }
      }
    } catch (err) {
      console.error('Error querying ongoing orders for workload:', err);
    }
    
    // Count customized orders with more robust checking
    const customizedOrdersCount = ongoingOrders.filter(order => 
      order.customized === 'Yes' || 
      order.customized === 'yes' || 
      order.customized === true || 
      order.customized === 'true'
    ).length;
    
    // Count regular orders
    const regularOrdersCount = ongoingOrders.length - customizedOrdersCount;
    
    // Get last completed order - Use order_date instead of updatedAt
    const lastCompletedOrder = await Order.findOne({
      where: {
        assigned_artisan: artisanFullName,
        order_status: {
          [Op.in]: ['Shipped', 'Delivered']
        }
      },
      order: [['order_date', 'DESC']] // Changed from updatedAt to order_date
    });
    
    // Format ongoing orders for display with consistent customized field
    const formattedOngoingOrders = ongoingOrders.map(order => {
      const isCustomized = order.customized === 'Yes' || 
                           order.customized === 'yes' || 
                           order.customized === true || 
                           order.customized === 'true';
      
      return {
        orderId: order.order_id,
        orderDate: order.orderDate,
        status: order.orderStatus,
        customized: isCustomized,
        customerName: order.customerInfo ? 
          `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : 
          'Unknown Customer'
      };
    });
    
    // Determine availability based on the new rules:
    // 1. If total ongoing orders > 5, artisan is busy
    // 2. If customized orders > 2 AND regular orders >= 1, artisan is busy
    let availability = 'Available';
    if (ongoingOrders.length > 5 || (customizedOrdersCount > 2 && regularOrdersCount >= 1)) {
      availability = 'Busy';
    }
    
    res.status(200).json({
      artisanId: id,
      artisanName: `${artisan.firstName} ${artisan.lastName}`,
      availability,
      ongoingOrdersCount: ongoingOrders.length,
      customizedOrdersCount,
      regularOrdersCount,
      ongoingOrders: formattedOngoingOrders,
      lastCompletedOrder: lastCompletedOrder ? {
        orderId: lastCompletedOrder.order_id,
        completedDate: lastCompletedOrder.orderDate // Changed from updatedAt to orderDate
      } : null
    });
  } catch (error) {
    console.error('Error fetching artisan workload:', error);
    res.status(500).json({
      message: 'Error fetching artisan workload',
      error: error.message
    });
  }
};

// Assign an order to an artisan
const assignOrderToArtisan = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { artisanId } = req.body;
    
    // Validate input
    if (!orderId || !artisanId) {
      return res.status(400).json({ message: 'Order ID and Artisan ID are required' });
    }
    
    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find the artisan
    const artisan = await Employee.findByPk(artisanId);
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    
    // Create the artisan's full name to use in the order
    const artisanFullName = `${artisan.firstName} ${artisan.lastName}`;
    console.log(`Assigning order ${orderId} to artisan: ${artisanFullName} (${artisanId})`);
    
    // Determine new status based on order type and current status
    let newStatus = order.orderStatus;
    const isCustomized = order.customized === 'Yes' || order.customized === 'yes' || order.customized === true || order.customized === 'true';
    const isFirstAssignment = !order.assignedArtisan && !order.assigned_artisan;
    if (isCustomized && isFirstAssignment) {
      newStatus = 'Review';
    } else if (!isCustomized && order.orderStatus === 'Processing') {
      newStatus = 'Processing'; // Keep as processing for normal orders
    }
    // Otherwise, keep the current status
    
    // Prepare update fields
    let updateFields = {};
    if ('assigned_artisan' in order.dataValues) {
      updateFields.assigned_artisan = artisanFullName;
    } 
    if ('assignedArtisan' in order.dataValues) {
      updateFields.assignedArtisan = artisanFullName;
    }
    if ('assignedArtisanId' in order.dataValues) {
      updateFields.assignedArtisanId = artisanId;
    }
    if ('assigned_artisan_id' in order.dataValues) {
      updateFields.assigned_artisan_id = artisanId;
    }
    if ('order_status' in order.dataValues) {
      updateFields.order_status = newStatus;
    } 
    if ('orderStatus' in order.dataValues) {
      updateFields.orderStatus = newStatus;
    }
    
    // Update the order with the determined fields
    await order.update(updateFields);
    
    res.status(200).json({
      message: 'Order assigned successfully',
      order: {
        id: order.order_id,
        status: newStatus,
        assignedArtisan: artisanFullName,
        assignedArtisanId: artisanId
      }
    });
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({
      message: 'Error assigning order to artisan',
      error: error.message
    });
  }
};

// Get orders eligible for assignment
const getAssignableOrders = async (req, res) => {
  try {
    // Find orders without assigned artisans
    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { assigned_artisan: null },
          { assigned_artisan: '' }
        ],
        order_status: {
          [Op.in]: ['Processing', 'Pending', 'To Pay', 'Awaiting Payment']
        }
      },
      include: [
        {
          model: Customer,
          as: 'customerInfo',
          attributes: ['firstName', 'lastName', 'email', 'phone']
        }
      ],
      order: [['order_date', 'DESC']]  // Use order_date for consistency
    });
    
    // Format orders for frontend with consistent customized field
    const formattedOrders = orders.map(order => {
      const isCustomized = order.customized === 'Yes' || 
                           order.customized === 'yes' || 
                           order.customized === true || 
                           order.customized === 'true';
                           
      return {
        id: order.order_id,
        orderDate: order.orderDate,
        customerName: order.customerInfo ? 
          `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : 
          'Unknown Customer',
        status: order.orderStatus,
        totalAmount: order.totalAmount,
        customized: isCustomized,
        actions: {
          viewOrder: true,  // Always allow viewing the order
          assignArtisan: true, // These orders are eligible for assignment
          cancel: !['Shipped', 'Delivered', 'Cancelled', 'Canceled'].includes(order.orderStatus)
        }
      };
    });
    
    res.status(200).json({
      count: formattedOrders.length,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching assignable orders:', error);
    res.status(500).json({
      message: 'Error fetching orders eligible for assignment',
      error: error.message
    });
  }
};

module.exports = {
  getAllArtisans,
  getArtisanById,
  getArtisanWorkload,
  assignOrderToArtisan,
  getAssignableOrders
};
