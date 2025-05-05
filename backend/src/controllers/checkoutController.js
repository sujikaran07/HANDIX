const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/db');
const { Customer } = require('../models/customerModel');
const { Address } = require('../models/addressModel');
const { Order } = require('../models/orderModel');
const { OrderDetail } = require('../models/orderDetailModel');
const Inventory = require('../models/inventoryModel');
const jwt = require('jsonwebtoken');

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Save shipping address without creating an order
 * This happens when user clicks "Continue" after entering shipping info
 */
exports.saveShippingAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customerInfo, shippingAddress } = req.body;
    
    // Check for authentication
    let customerId = null;
    let existingCustomerData = null;
    let isExistingCustomer = false;
    
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const user = verifyToken(token);
      if (user) {
        customerId = user.c_id;
        
        // Fetch existing customer data to check phone
        existingCustomerData = await Customer.findByPk(customerId);
        if (existingCustomerData) {
          isExistingCustomer = true;
        }
      }
    }
    
    // If not authenticated or authentication failed, handle as guest or find by email
    if (!customerId && customerInfo) {
      // Try to find customer by email
      let customer = await Customer.findOne({ 
        where: { email: customerInfo.email }
      });
      
      if (customer) {
        customerId = customer.c_id;
        existingCustomerData = customer;
        isExistingCustomer = true;
      } else {
        // Create a temporary guest customer
        const guestId = `G-${Date.now().toString().slice(-8)}`;
        customer = await Customer.create({
          c_id: guestId,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone || '',
          password: uuidv4(), // Generate a random password for guest accounts
          accountType: 'Retail',
          accountStatus: 'Pending'
        }, { transaction });
        
        customerId = guestId;
      }
    }
    
    // If customer exists but doesn't have a phone number, update it
    if (isExistingCustomer && !existingCustomerData.phone && customerInfo.phone) {
      await Customer.update(
        { phone: customerInfo.phone },
        { where: { c_id: customerId }, transaction }
      );
      console.log(`Updated phone number for customer ${customerId}: ${customerInfo.phone}`);
    }
    
    // Create or update shipping address
    let existingAddress = null;
    
    if (customerId) {
      // Check if customer already has a shipping address
      existingAddress = await Address.findOne({
        where: {
          c_id: customerId,
          addressType: 'shipping'
        }
      });
    }
    
    let addressData;
    
    if (existingAddress) {
      // Update existing address
      await existingAddress.update({
        street_address: shippingAddress.street,
        city: shippingAddress.city,
        district: shippingAddress.district,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Sri Lanka',
        updatedAt: new Date()
      }, { transaction });
      
      addressData = existingAddress;
    } else {
      // Create new address
      addressData = await Address.create({
        c_id: customerId,
        addressType: 'shipping',
        street_address: shippingAddress.street,
        city: shippingAddress.city,
        district: shippingAddress.district,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Sri Lanka'
      }, { transaction });
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Return success response with customer details
    return res.status(200).json({
      success: true,
      customerId,
      addressId: addressData.address_id,
      customerData: isExistingCustomer ? {
        firstName: existingCustomerData.firstName,
        lastName: existingCustomerData.lastName,
        email: existingCustomerData.email,
        phone: existingCustomerData.phone || customerInfo.phone
      } : null,
      message: 'Shipping address saved successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error saving shipping address:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error saving shipping address',
      error: error.message
    });
  }
};

/**
 * Save billing address without creating an order
 * This happens when user clicks "Continue" after entering billing info
 */
exports.saveBillingAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customerId, billingAddress, sameAsShipping } = req.body;
    
    if (sameAsShipping) {
      // If same as shipping, no need to create new address
      await transaction.commit();
      return res.status(200).json({
        success: true,
        message: 'Using shipping address as billing address'
      });
    }
    
    // Check if customer already has a billing address
    const existingAddress = await Address.findOne({
      where: {
        c_id: customerId,
        addressType: 'billing'
      }
    });
    
    let addressData;
    
    if (existingAddress) {
      // Update existing address
      await existingAddress.update({
        street_address: billingAddress.street,
        city: billingAddress.city,
        district: billingAddress.district,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country || 'Sri Lanka',
        updatedAt: new Date()
      }, { transaction });
      
      addressData = existingAddress;
    } else {
      // Create new address
      addressData = await Address.create({
        c_id: customerId,
        addressType: 'billing',
        street_address: billingAddress.street,
        city: billingAddress.city,
        district: billingAddress.district,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country || 'Sri Lanka'
      }, { transaction });
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Return success response
    return res.status(200).json({
      success: true,
      addressId: addressData.address_id,
      message: 'Billing address saved successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error saving billing address:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error saving billing address',
      error: error.message
    });
  }
};

/**
 * Fetch customer's saved addresses
 */
exports.getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Validate customer ID
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }
    
    // Fetch customer details and addresses
    const customer = await Customer.findByPk(customerId, {
      include: [
        {
          model: Address,
          as: 'addresses'
        }
      ]
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Return customer data and addresses
    return res.status(200).json({
      success: true,
      customer: {
        c_id: customer.c_id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      },
      addresses: customer.addresses || []
    });
    
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching customer addresses',
      error: error.message
    });
  }
};

/**
 * Place a new order
 */
exports.placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customerInfo, shippingAddress, billingAddress, orderItems, orderSummary, paymentInfo, shippingMethod, pickupLocation } = req.body;
    
    // Check for authentication
    let customerId = null;
    let user = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      user = verifyToken(token);
      if (user) {
        customerId = user.c_id;
      }
    }
    
    // If not authenticated or authentication failed, handle as guest
    if (!customerId && customerInfo) {
      // Try to find customer by email
      let customer = await Customer.findOne({ 
        where: { email: customerInfo.email }
      });
      
      if (customer) {
        customerId = customer.c_id;
      } else {
        // Create a new guest customer
        const guestId = `G-${Date.now().toString().slice(-8)}`;
        customer = await Customer.create({
          c_id: guestId,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone || '',
          password: uuidv4(), // Generate a random password for guest accounts
          accountType: 'Retail',
          accountStatus: 'Pending'
        }, { transaction });
        
        customerId = guestId;
      }
    }
    
    // First check if shipping address already exists for this customer
    let shippingAddressId = null;
    
    const existingShippingAddress = await Address.findOne({
      where: {
        c_id: customerId,
        addressType: 'shipping'
      }
    });
    
    if (existingShippingAddress && 
        existingShippingAddress.street_address === shippingAddress.street &&
        existingShippingAddress.city === shippingAddress.city &&
        existingShippingAddress.district === shippingAddress.district &&
        existingShippingAddress.postalCode === shippingAddress.postalCode) {
      // Use existing address if unchanged
      shippingAddressId = existingShippingAddress.address_id;
    } else {
      // Create new shipping address if changed
      const newShippingAddress = await Address.create({
        c_id: customerId,
        addressType: 'shipping',
        street_address: shippingAddress.street,
        city: shippingAddress.city,
        district: shippingAddress.district,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Sri Lanka'
      }, { transaction });
      
      shippingAddressId = newShippingAddress.address_id;
    }
    
    // Create billing address if different
    let billingAddressId = null;
    
    // Check if billing is same as shipping
    const sameAsShipping = !billingAddress;
    
    if (sameAsShipping) {
      // Use shipping address for billing
      billingAddressId = shippingAddressId;
    } else {
      // Check if billing address already exists
      const existingBillingAddress = await Address.findOne({
        where: {
          c_id: customerId,
          addressType: 'billing'
        }
      });
      
      if (existingBillingAddress &&
          existingBillingAddress.street_address === billingAddress.street &&
          existingBillingAddress.city === billingAddress.city &&
          existingBillingAddress.district === billingAddress.district &&
          existingBillingAddress.postalCode === billingAddress.postalCode) {
        // Use existing billing address if unchanged
        billingAddressId = existingBillingAddress.address_id;
      } else {
        // Create new billing address
        const newBillingAddress = await Address.create({
          c_id: customerId,
          addressType: 'billing',
          street_address: billingAddress.street,
          city: billingAddress.city,
          district: billingAddress.district,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country || 'Sri Lanka'
        }, { transaction });
        
        billingAddressId = newBillingAddress.address_id;
      }
    }
    
    // Generate order ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
    
    // Create order
    const newOrder = await Order.create({
      order_id: orderId,
      c_id: customerId,
      shipping_address_id: shippingAddressId,
      billing_address_id: billingAddressId,
      order_date: new Date(),
      status: paymentInfo.method === 'cod' ? 'pending' : 'awaiting_payment',
      payment_method: paymentInfo.method,
      shipping_method: shippingMethod,
      subtotal: orderSummary.subtotal,
      shipping_fee: orderSummary.shippingFee,
      total_amount: orderSummary.total
    }, { transaction });
    
    // Create order details for each item
    for (const item of orderItems) {
      await OrderDetail.create({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
        customization_fee: item.customizationFee || 0
      }, { transaction });
      
      // Update inventory quantities
      await Inventory.decrement('stock_quantity', {
        by: item.quantity,
        where: { product_id: item.productId },
        transaction
      });
    }
    
    // Generate payment URLs for third-party payment processors
    let paymentUrl = null;
    if (paymentInfo.method === 'paypal') {
      // Mock PayPal checkout URL
      paymentUrl = `https://www.paypal.com/checkoutnow?token=${orderId}`;
    } else if (paymentInfo.method === 'gpay') {
      // Mock Google Pay checkout URL
      paymentUrl = `https://pay.google.com/checkout?orderid=${orderId}`;
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Return success response
    return res.status(201).json({
      success: true,
      orderId,
      paymentUrl,
      message: 'Order placed successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error placing order:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error placing order',
      error: error.message
    });
  }
};

/**
 * Get order details by order ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    return res.status(200).json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Error getting order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving order details',
      error: error.message
    });
  }
};

/**
 * Update payment status for an order
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, transactionId } = req.body;
    
    const order = await Order.findOne({
      where: { order_id: orderId }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update order status based on payment status
    await Order.update({
      payment_status: paymentStatus,
      transaction_id: transactionId,
      status: paymentStatus === 'completed' ? 'processing' : 'awaiting_payment',
      updated_at: new Date()
    }, {
      where: { order_id: orderId }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};
