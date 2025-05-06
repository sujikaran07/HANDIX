const { v4: uuidv4 } = require('uuid');
const { sequelize, Sequelize } = require('../../config/db'); // Import Sequelize module
const { Customer } = require('../../models/customerModel');
const { Address } = require('../../models/addressModel');
const { Order } = require('../../models/orderModel');
const { OrderDetail } = require('../../models/orderDetailModel');
const Inventory = require('../../models/inventoryModel');
const { Transaction } = require('../../models/transactionModel');
const { PaymentMethod } = require('../../models/paymentMethodModel');
const { ShippingMethod } = require('../../models/shippingMethodModel');
const ProductEntry = require('../../models/productEntryModel'); // Import ProductEntry
const ProductVariation = require('../../models/productVariationModel'); // Import ProductVariation
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
    
    // If customer exists, always update their phone number if provided in the request
    // This ensures we have the most current contact information for delivery
    if (isExistingCustomer && customerInfo.phone) {
      await Customer.update(
        { phone: customerInfo.phone },
        { where: { c_id: customerId }, transaction }
      );
      console.log(`Updated phone number for customer ${customerId}: ${customerInfo.phone}`);
    }
    
    // Get the most recent shipping address if any exists
    let existingAddress = null;
    let shouldCreateNewAddress = true;
    let addressData = null; // Declare addressData here so it's in scope
    
    if (customerId) {
      existingAddress = await Address.findOne({
        where: {
          c_id: customerId,
          addressType: 'shipping'
        },
        order: [['createdAt', 'DESC']]
      });
      
      // Check if the address is the same as the existing one
      if (existingAddress && 
          existingAddress.street_address === shippingAddress.street &&
          existingAddress.city === shippingAddress.city &&
          existingAddress.district === shippingAddress.district &&
          existingAddress.postalCode === shippingAddress.postalCode) {
        // Address hasn't changed, don't create a new one
        shouldCreateNewAddress = false;
        addressData = existingAddress; // This is fine now since addressData is declared above
        console.log(`Using existing shipping address for customer ${customerId} - no changes detected`);
      }
    }
    
    if (shouldCreateNewAddress) {
      // Always create a new address record if fields differ from the most recent one
      addressData = await Address.create({
        c_id: customerId,
        addressType: 'shipping',
        street_address: shippingAddress.street,
        city: shippingAddress.city,
        district: shippingAddress.district,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Sri Lanka'
      }, { transaction });
      
      console.log(`Created new shipping address for customer ${customerId} - field values changed`);
    }
    
    // Make sure to update the phone number regardless of whether a new address is created
    if (isExistingCustomer && customerInfo.phone) {
      console.log(`Updating phone number for customer ${customerId} from ${existingCustomerData.phone || 'empty'} to ${customerInfo.phone}`);
      
      await Customer.update(
        { phone: customerInfo.phone },
        { where: { c_id: customerId }, transaction }
      );
      
      // Refresh the customer data to get the updated phone
      existingCustomerData = await Customer.findByPk(customerId, { transaction });
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
        // Always return the latest phone number (from request or database)
        phone: customerInfo.phone || existingCustomerData.phone || ''
      } : null,
      message: shouldCreateNewAddress ? 
        'New shipping address saved successfully' : 
        'Existing shipping address used'
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
      // If same as shipping, get the most recent shipping address
      const shippingAddress = await Address.findOne({
        where: {
          c_id: customerId,
          addressType: 'shipping'
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (shippingAddress) {
        // Always create a new billing address as a copy of shipping address
        // This preserves history of addresses used
        const newBillingAddress = await Address.create({
          c_id: customerId,
          addressType: 'billing',
          street_address: shippingAddress.street_address,
          city: shippingAddress.city,
          district: shippingAddress.district,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'Sri Lanka'
        }, { transaction });
        
        console.log(`Created new billing address (copied from shipping) for customer ${customerId}`);
        
        await transaction.commit();
        return res.status(200).json({
          success: true,
          addressId: newBillingAddress.address_id,
          message: 'New billing address created from shipping address'
        });
      }
    }
    
    // Check if customer already has a billing address with the same values
    let shouldCreateNewAddress = true;
    let existingAddress = null;
    
    existingAddress = await Address.findOne({
      where: {
        c_id: customerId,
        addressType: 'billing'
      },
      order: [['createdAt', 'DESC']]
    });
    
    if (existingAddress && 
        existingAddress.street_address === billingAddress.street &&
        existingAddress.city === billingAddress.city &&
        existingAddress.district === billingAddress.district &&
        existingAddress.postalCode === billingAddress.postalCode) {
      // Address hasn't changed, don't create a new one
      shouldCreateNewAddress = false;
      addressData = existingAddress;
      console.log(`Using existing billing address for customer ${customerId} - no changes detected`);
    }
    
    let addressData;
    
    if (shouldCreateNewAddress) {
      // Create new billing address if values are different
      addressData = await Address.create({
        c_id: customerId,
        addressType: 'billing',
        street_address: billingAddress.street,
        city: billingAddress.city,
        district: billingAddress.district,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country || 'Sri Lanka'
      }, { transaction });
      
      console.log(`Created new billing address for customer ${customerId} - field values changed`);
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Return success response
    return res.status(200).json({
      success: true,
      addressId: addressData.address_id,
      message: shouldCreateNewAddress ? 
        'New billing address saved successfully' : 
        'Existing billing address used'
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
    
    // Fetch customer details and addresses with proper ordering
    const customer = await Customer.findByPk(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Fetch addresses separately with proper ordering
    const addresses = await Address.findAll({
      where: { c_id: customerId },
      order: [['createdAt', 'DESC']] // Order by most recent first
    });
    
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
      addresses: addresses || []
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
    const { 
      customerInfo, 
      shippingAddress, 
      billingAddress, 
      orderItems, 
      orderSummary, 
      paymentInfo, 
      shippingMethod, 
      pickupLocation 
    } = req.body;
    
    // Check COD limit - reject orders over 5000 LKR if payment method is COD
    if (paymentInfo.method === 'cod' && parseFloat(orderSummary.total) > 5000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cash on Delivery is only available for orders under LKR 5,000. Please choose another payment method.'
      });
    }
    
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
      // Copy shipping address data to create a billing address record
      if (existingShippingAddress) {
        // Check if billing address exists
        const existingBillingAddress = await Address.findOne({
          where: {
            c_id: customerId,
            addressType: 'billing'
          }
        });
        
        if (existingBillingAddress) {
          // Update existing billing address
          await existingBillingAddress.update({
            street_address: existingShippingAddress.street_address,
            city: existingShippingAddress.city,
            district: existingShippingAddress.district,
            postalCode: existingShippingAddress.postalCode,
            country: existingShippingAddress.country || 'Sri Lanka',
            updatedAt: new Date()
          }, { transaction });
          
          billingAddressId = existingBillingAddress.address_id;
        } else {
          // Create new billing address as copy of shipping
          const newBillingAddress = await Address.create({
            c_id: customerId,
            addressType: 'billing',
            street_address: existingShippingAddress.street_address,
            city: existingShippingAddress.city,
            district: existingShippingAddress.district,
            postalCode: existingShippingAddress.postalCode,
            country: existingShippingAddress.country || 'Sri Lanka'
          }, { transaction });
          
          billingAddressId = newBillingAddress.address_id;
        }
      }
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
    
    // Generate order ID in O001 format with sequential numbering
    // Get the latest order ID from the database
    let orderId;
    
    try {
      const latestOrder = await Order.findOne({
        where: {
          order_id: {
            [Sequelize.Op.like]: 'O%'
          }
        },
        order: [['order_id', 'DESC']]
      });
      
      if (latestOrder) {
        // Extract the numeric part
        const numericPart = parseInt(latestOrder.order_id.substring(1), 10);
        // Increment by 1 and pad with zeros
        orderId = `O${(numericPart + 1).toString().padStart(3, '0')}`;
      } else {
        // If no orders exist, start with O001
        orderId = 'O001';
      }
    } catch (error) {
      console.error('Error generating sequential order ID:', error);
      // Fallback to random order ID if there's an error
      const num = Math.floor(Math.random() * 999) + 1;
      orderId = `O${num.toString().padStart(3, '0')}`;
    }
    
    // Check if this ID already exists (just to be sure)
    const existingOrder = await Order.findByPk(orderId);
    if (existingOrder) {
      // In the rare case of collision, use the current timestamp
      const timestamp = new Date().getTime().toString().slice(-3);
      orderId = `O${timestamp}`;
    }
    
    // Construct customer name
    const customerName = customerInfo ? 
      `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() : 
      user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
      'Guest Customer';
    
    // Check if customer is wholesale type to apply discount
    const isWholesaleCustomer = customerInfo?.accountType === 'Wholesale';
    
    // Apply wholesale discount to order if applicable
    let finalTotal = parseFloat(orderSummary.total);
    if (isWholesaleCustomer) {
      console.log('Processing wholesale customer order - applying 5% discount');
    }
    
    // Create new order with the custom generated ID
    const newOrder = await Order.create({
      order_id: orderId,
      c_id: customerId,
      orderStatus: paymentInfo.method === 'cod' ? 'Pending' : 'Awaiting Payment',
      totalAmount: finalTotal, // Use potentially discounted amount
      paymentStatus: paymentInfo.method === 'cod' ? 'Pending' : 'Awaiting',
      shippingMethodId: null, // This will be updated later with the correct shipping method ID
      orderDate: new Date(),
      customerName: customerName,
      customized: orderItems.some(item => item.customization) ? 'yes' : 'no',
      paymentMethod: paymentInfo.method,
      wholesaleDiscount: isWholesaleCustomer ? 'yes' : 'no' // Track if wholesale discount was applied
    }, { transaction });
    
    // Create order details for each item and update inventory
    for (const item of orderItems) {
      // Create order detail with customization field and potentially discounted price
      await OrderDetail.create({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price, // This is now potentially already discounted from frontend
        customization: item.customization || null,
        customization_fee: item.customizationFee || 0,
        original_price: item.originalPrice || item.price // Store original price for reference
      }, { transaction });
      
      // Update inventory quantities across multiple tables
      try {
        // 1. Update main Inventory table
        const inventory = await Inventory.findOne({ 
          where: { product_id: item.productId } 
        });
        
        if (inventory) {
          if (inventory.quantity < item.quantity) {  // Changed from stock_quantity to quantity
            // If not enough inventory, roll back and return error
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: `Not enough inventory for product ID: ${item.productId}`
            });
          }
          
          // Update the correct column name: quantity in Inventory table (not stock_quantity)
          await inventory.update({
            quantity: inventory.quantity - item.quantity,  // Changed from stock_quantity to quantity
            last_updated: new Date()
          }, { transaction });
        }
        
        // 2. Update ProductVariation quantity if this is a variant
        if (item.variationId) {
          const variation = await ProductVariation.findByPk(item.variationId);
          if (variation) {
            if (variation.stock_level < item.quantity) { // Use correct column name: stock_level
              // If not enough in this variation, roll back
              await transaction.rollback();
              return res.status(400).json({
                success: false, 
                message: `Not enough stock for variation ID: ${item.variationId}`
              });
            }
            
            // Update the correct column name: stock_level in ProductVariation
            await variation.update({
              stock_level: variation.stock_level - item.quantity // Updated from stock to stock_level
            }, { transaction });
          }
        }
        
        // 3. Don't update ProductEntry table - we just fetch product entry for category info
        const productEntry = await ProductEntry.findOne({
          where: { product_id: item.productId }
        });
        
        // 4. REMOVED: Category statistics update with items_sold field
        // The "items_sold" column does not exist in Categories table
        // We'll comment this out rather than trying to update a non-existent column
        
        /*
        if (productEntry && productEntry.category_id) {
          // This was causing the error - the column doesn't exist
          await sequelize.query(
            `UPDATE "Categories" 
             SET items_sold = items_sold + :quantity
             WHERE category_id = :categoryId`,
            { 
              replacements: { 
                quantity: item.quantity,
                categoryId: productEntry.category_id
              },
              type: sequelize.QueryTypes.UPDATE,
              transaction
            }
          );
        }
        */
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        // Don't throw here - we'll continue and try to complete the order
        // but log the error for investigation
      }
    }
    
    // Create shipping method record for the order
    try {
      let shippingMethodRecord;
      
      // First look up the shipping methods instead of creating them
      if (shippingMethod === 'pickup') {
        shippingMethodRecord = await ShippingMethod.findOne({ 
          where: { method_name: 'Store Pickup' }
        });
        
        // Only create if it absolutely doesn't exist
        if (!shippingMethodRecord) {
          try {
            shippingMethodRecord = await ShippingMethod.create({
              method_name: 'Store Pickup',
              price: 0.00
            }, { transaction });
          } catch (createError) {
            console.error('Error creating pickup shipping method:', createError);
            // Attempt to find again in case creation failed but method exists
            shippingMethodRecord = await ShippingMethod.findOne({ 
              where: { method_name: 'Store Pickup' }
            });
          }
        }
      } else {
        shippingMethodRecord = await ShippingMethod.findOne({ 
          where: { method_name: 'Standard Delivery' }
        });
        
        // Only create if it absolutely doesn't exist
        if (!shippingMethodRecord) {
          try {
            shippingMethodRecord = await ShippingMethod.create({
              method_name: 'Standard Delivery',
              price: calculateShippingCost(shippingAddress?.district || 'Unknown')
            }, { transaction });
          } catch (createError) {
            console.error('Error creating standard shipping method:', createError);
            // Attempt to find again in case creation failed but method exists
            shippingMethodRecord = await ShippingMethod.findOne({ 
              where: { method_name: 'Standard Delivery' }
            });
          }
        }
      }
      
      // Only try to update if we have a valid shipping method record
      if (shippingMethodRecord && shippingMethodRecord.shipping_method_id) {
        await Order.update(
          { shippingMethodId: shippingMethodRecord.shipping_method_id },
          { 
            where: { order_id: orderId },
            transaction 
          }
        );
        
        console.log(`Updated order with shipping method ID: ${shippingMethodRecord.shipping_method_id}`);
      } else {
        console.log('No shipping method ID available to update order');
      }
    } catch (error) {
      console.error('Error handling shipping method:', error);
      // Continue with the order even if shipping method fails
    }
    
    try {
      // Create transaction record
      const transactionRecord = await Transaction.create({
        order_id: orderId,
        c_id: customerId,
        amount: orderSummary.total,
        paymentMethod: paymentInfo.method,
        transactionDate: new Date(),
        transactionStatus: paymentInfo.method === 'cod' ? 'pending' : 'awaiting_payment',
        paymentGateway: paymentInfo.method === 'card' ? 'stripe' : 
                      paymentInfo.method === 'paypal' ? 'paypal' : 
                      paymentInfo.method === 'gpay' ? 'google_pay' : 
                      'manual',
        gatewayTransactionId: null,
        currency: 'LKR',
        notes: `Order placed via website. ${paymentInfo.method === 'cod' ? 'Cash on Delivery payment.' : ''}`
      }, { transaction });
      
      console.log(`Transaction created with ID: ${transactionRecord.transaction_id}`);
    } catch (error) {
      console.error('Error creating transaction record:', error);
      // Continue with the order even if transaction record creation fails
    }
    
    // Create payment method record
    try {
      if (paymentInfo.method !== 'cod') {
        // Check if this payment method already exists
        let existingPaymentMethod = null;
        
        if (customerId) {
          existingPaymentMethod = await PaymentMethod.findOne({
            where: {
              c_id: customerId,
              methodType: paymentInfo.method
            }
          });
          
          // Build payment details object
          const paymentDetails = {};
          if (paymentInfo.method === 'card' && paymentInfo.cardDetails) {
            // Store only last 4 digits of card number for security
            paymentDetails.lastFour = paymentInfo.cardDetails.cardNumber.slice(-4);
            paymentDetails.brand = detectCardBrand(paymentInfo.cardDetails.cardNumber);
            
            if (paymentInfo.cardDetails.expiry && paymentInfo.cardDetails.expiry.includes('/')) {
              const [month, year] = paymentInfo.cardDetails.expiry.split('/');
              paymentDetails.expiryMonth = month.trim();
              paymentDetails.expiryYear = year.trim();
            }
          }
          
          // Create or update payment method
          if (!existingPaymentMethod) {
            // Create new payment method
            await PaymentMethod.create({
              c_id: customerId,
              methodType: paymentInfo.method,
              isDefault: true,
              details: paymentDetails
            }, { transaction });
            
            // Set all other payment methods as non-default using standard update format instead of raw query
            await PaymentMethod.update(
              { isDefault: false },
              { 
                where: { 
                  c_id: customerId, 
                  methodType: { [Sequelize.Op.ne]: paymentInfo.method } 
                },
                transaction
              }
            );
          } else {
            // Update existing payment method
            await existingPaymentMethod.update({
              isDefault: true,
              details: { ...existingPaymentMethod.details, ...paymentDetails }
            }, { transaction });
            
            // Set all other payment methods as non-default using standard update format
            await PaymentMethod.update(
              { isDefault: false },
              { 
                where: { 
                  c_id: customerId, 
                  method_id: { [Sequelize.Op.ne]: existingPaymentMethod.method_id } 
                },
                transaction
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error creating/updating payment method:', error);
      // Continue with the order even if payment method update fails
    }
    
    // Update customer statistics - track order count, spending and last order date
    try {
      if (customerId) {
        const customer = await Customer.findByPk(customerId);
        
        if (customer) {
          // Get current values with fallback to 0
          const currentOrderCount = customer.totalOrders || 0;
          const currentSpent = parseFloat(customer.totalSpent || 0);
          
          // Use standard update with properly defined column names
          await Customer.update(
            {
              totalOrders: parseInt(currentOrderCount) + 1,
              totalSpent: currentSpent + parseFloat(orderSummary.total),
              lastOrderDate: new Date()
            },
            {
              where: { c_id: customerId },
              transaction
            }
          );
          
          console.log(`Updated stats for customer ${customerId}: Orders=${currentOrderCount + 1}, Spent=${currentSpent + parseFloat(orderSummary.total)}`);
        }
      }
    } catch (statsError) {
      console.error('Error updating customer statistics:', statsError);
      // Continue with order processing even if stats update fails
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
    
    // Send invoice email to the customer after successful order placement
    try {
      // Fetch complete order with details
      const orderWithDetails = await Order.findOne({
        where: { order_id: orderId },
        include: [{ 
          model: OrderDetail, 
          as: 'orderDetails' 
        }]
      });
      
      if (orderWithDetails) {
        // Get customer email address
        const customerEmail = customerInfo?.email || 
          (user?.email) || 
          (await Customer.findByPk(customerId))?.email;
        
        if (customerEmail) {
          // Prepare order data for email
          const emailOrderData = {
            ...orderWithDetails.toJSON(),
            customerEmail,
            shippingFee: orderSummary.shippingFee
          };
          
          // Import email service dynamically to avoid circular dependencies
          const { sendInvoiceEmail } = require('../../utils/emailService');
          
          console.log(`Attempting to send invoice email to ${customerEmail}`);
          
          // Send invoice email (don't wait for this to complete)
          sendInvoiceEmail(emailOrderData)
            .then(sent => {
              if (sent) {
                console.log(`Invoice email sent successfully to ${customerEmail} for order ${orderId}`);
              } else {
                console.log(`Failed to send invoice email to ${customerEmail} for order ${orderId}`);
              }
            })
            .catch(err => {
              console.error('Error in email sending process:', err);
              // On error, still return success since order is completed
            });
        } else {
          console.log(`No customer email found to send invoice for order ${orderId}`);
        }
      } else {
        console.log(`Could not find order details for invoice email for order ${orderId}`);
      }
    } catch (emailError) {
      console.error('Error preparing invoice email:', emailError);
      // Continue with order completion even if email fails
    }
    
    // Return success response
    return res.status(201).json({
      success: true,
      orderId,
      paymentUrl, // If defined above
      message: 'Order placed successfully',
      wholesaleDiscount: isWholesaleCustomer
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

// Helper function to detect card brand based on the first few digits
function detectCardBrand(cardNumber) {
  const cleanedNumber = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleanedNumber)) return 'Visa';
  if (/^(5[1-5])/.test(cleanedNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanedNumber)) return 'American Express';
  if (/^(6011|65|64[4-9]|622)/.test(cleanedNumber)) return 'Discover';
  
  return 'Unknown';
}

// Helper function to calculate shipping cost based on district
function calculateShippingCost(district) {
  const standardRate = 350;
  const highRateDistricts = ['Colombo', 'Gampaha', 'Kalutara'];
  
  if (!district) return standardRate;
  
  return highRateDistricts.includes(district) ? standardRate + 100 : standardRate;
}

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
  const sqlTransaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { paymentStatus, transactionId } = req.body;
    
    const order = await Order.findOne({
      where: { order_id: orderId }
    });
    
    if (!order) {
      await sqlTransaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update order status based on payment status
    await Order.update({
      paymentStatus: paymentStatus,
      orderStatus: paymentStatus === 'completed' ? 'processing' : 'awaiting_payment',
      updated_at: new Date()
    }, {
      where: { order_id: orderId },
      transaction: sqlTransaction
    });
    
    // Update transaction record as well
    try {
      const existingTransaction = await Transaction.findOne({
        where: { order_id: orderId }
      });
      
      if (existingTransaction) {
        // Update the existing transaction
        await existingTransaction.update({
          transactionStatus: paymentStatus,
          gatewayTransactionId: transactionId || existingTransaction.gatewayTransactionId,
          notes: existingTransaction.notes + ` Payment status updated to ${paymentStatus}.`
        }, { transaction: sqlTransaction });
        
        // Also update the related payment method if applicable
        if (existingTransaction.paymentMethod && paymentStatus === 'completed') {
          // Find the payment method used for this transaction
          const paymentMethod = await PaymentMethod.findOne({
            where: {
              c_id: existingTransaction.c_id,
              methodType: existingTransaction.paymentMethod
            }
          });
          
          // If found, update the payment method details
          if (paymentMethod) {
            const updatedDetails = { 
              ...paymentMethod.details,
              lastUsed: new Date().toISOString()
            };
            
            await paymentMethod.update({
              details: updatedDetails
            }, { transaction: sqlTransaction });
            
            console.log(`Updated payment method ${paymentMethod.method_id} with last used date`);
          }
        }
        
        // Create transaction status history entry - using standard create instead of raw query
        try {
          await sequelize.models.TransactionStatusHistory.create({
            transaction_id: existingTransaction.transaction_id,
            previous_status: existingTransaction.transactionStatus,
            new_status: paymentStatus,
            changed_at: new Date(),
            changed_by: 'system',
            notes: 'Payment status updated via API'
          }, { transaction: sqlTransaction });
        } catch (historyError) {
          console.error('Error creating transaction history:', historyError);
          // Continue with the order even if history creation fails
        }
      }
    } catch (error) {
      console.error('Error updating transaction record:', error);
      // Continue even if transaction update fails
    }
    
    await sqlTransaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully'
    });
    
  } catch (error) {
    await sqlTransaction.rollback();
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};
