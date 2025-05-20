const { v4: uuidv4 } = require('uuid');
const { sequelize, Sequelize } = require('../../config/db');
const { Customer } = require('../../models/customerModel');
const { Address } = require('../../models/addressModel');
const { Order } = require('../../models/orderModel');
const { OrderDetail } = require('../../models/orderDetailModel');
const Inventory = require('../../models/inventoryModel');
const { Transaction } = require('../../models/transactionModel');
const { PaymentMethod } = require('../../models/paymentMethodModel');
const { ShippingMethod } = require('../../models/shippingMethodModel');
const ProductEntry = require('../../models/productEntryModel');
const ProductVariation = require('../../models/productVariationModel');
const jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

exports.saveShippingAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customerInfo, shippingAddress } = req.body;
    
    let customerId = null;
    let existingCustomerData = null;
    let isExistingCustomer = false;
    
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const user = verifyToken(token);
      if (user) {
        customerId = user.c_id;
        
        existingCustomerData = await Customer.findByPk(customerId);
        if (existingCustomerData) {
          isExistingCustomer = true;
        }
      }
    }
    
    if (!customerId && customerInfo) {
      let customer = await Customer.findOne({ 
        where: { email: customerInfo.email }
      });
      
      if (customer) {
        customerId = customer.c_id;
        existingCustomerData = customer;
        isExistingCustomer = true;
      } else {
        const guestId = `G-${Date.now().toString().slice(-8)}`;
        customer = await Customer.create({
          c_id: guestId,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone || '',
          password: uuidv4(),
          accountType: 'Retail',
          accountStatus: 'Pending'
        }, { transaction });
        
        customerId = guestId;
      }
    }
    
    if (isExistingCustomer && customerInfo.phone) {
      await Customer.update(
        { phone: customerInfo.phone },
        { where: { c_id: customerId }, transaction }
      );
      console.log(`Updated phone number for customer ${customerId}: ${customerInfo.phone}`);
    }
    
    let existingAddress = null;
    let shouldCreateNewAddress = true;
    let addressData = null;
    
    if (customerId) {
      const allCustomerAddresses = await Address.findAll({
        where: {
          c_id: customerId,
          addressType: 'shipping'
        },
        order: [['createdAt', 'DESC']]
      });
      
      const matchingAddress = allCustomerAddresses.find(addr => 
        addr.street_address === shippingAddress.street &&
        addr.city === shippingAddress.city &&
        addr.district === shippingAddress.district &&
        addr.postalCode === shippingAddress.postalCode
      );
      
      if (matchingAddress) {
        shouldCreateNewAddress = false;
        addressData = matchingAddress;
        console.log(`Using existing shipping address for customer ${customerId} - exact match found`);
      } else {
        console.log(`No matching address found for customer ${customerId} - will create new address`);
        if (allCustomerAddresses.length > 0) {
          const mostRecent = allCustomerAddresses[0];
          console.log('Most recent address vs new address:');
          console.log(`Street: "${mostRecent.street_address}" vs "${shippingAddress.street}"`);
          console.log(`City: "${mostRecent.city}" vs "${shippingAddress.city}"`);
          console.log(`District: "${mostRecent.district}" vs "${shippingAddress.district}"`);
          console.log(`Postal Code: "${mostRecent.postalCode}" vs "${shippingAddress.postalCode}"`);
        }
      }
    }
    
    if (shouldCreateNewAddress) {
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
    
    if (isExistingCustomer && customerInfo.phone) {
      console.log(`Updating phone number for customer ${customerId} from ${existingCustomerData.phone || 'empty'} to ${customerInfo.phone}`);
      
      await Customer.update(
        { phone: customerInfo.phone },
        { where: { c_id: customerId }, transaction }
      );
      
      existingCustomerData = await Customer.findByPk(customerId, { transaction });
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      customerId,
      addressId: addressData.address_id,
      customerData: isExistingCustomer ? {
        firstName: existingCustomerData.firstName,
        lastName: existingCustomerData.lastName,
        email: existingCustomerData.email,
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

exports.saveBillingAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { customerId, billingAddress, sameAsShipping } = req.body;
    
    if (sameAsShipping) {
      const shippingAddress = await Address.findOne({
        where: {
          c_id: customerId,
          addressType: 'shipping'
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (shippingAddress) {
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
      shouldCreateNewAddress = false;
      addressData = existingAddress;
      console.log(`Using existing billing address for customer ${customerId} - no changes detected`);
    }
    
    let addressData;
    
    if (shouldCreateNewAddress) {
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
    
    await transaction.commit();
    
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

exports.getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }
    
    const customer = await Customer.findByPk(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const addresses = await Address.findAll({
      where: { c_id: customerId },
      order: [['createdAt', 'DESC']]
    });
    
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
    
    if (paymentInfo.method === 'cod' && parseFloat(orderSummary.total) > 5000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cash on Delivery is only available for orders under LKR 5,000. Please choose another payment method.'
      });
    }
    
    let customerId = null;
    let user = null;
    let accountType = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      user = verifyToken(token);
      if (user) {
        customerId = user.c_id;
      }
    }
    
    if (!customerId && customerInfo) {
      let customer = await Customer.findOne({ 
        where: { email: customerInfo.email }
      });
      
      if (customer) {
        customerId = customer.c_id;
      } else {
        const guestId = `G-${Date.now().toString().slice(-8)}`;
        customer = await Customer.create({
          c_id: guestId,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone || '',
          password: uuidv4(),
          accountType: 'Retail',
          accountStatus: 'Pending'
        }, { transaction });
        
        customerId = guestId;
      }
    }
    
    // --- Fetch account type for business logic ---
    if (customerId) {
      const customer = await Customer.findByPk(customerId);
      if (customer && customer.accountType) {
        accountType = customer.accountType;
      }
    }
    // --- Calculate shipping fee and discount for business accounts ---
    let shippingFee = 0;
    if (shippingMethod === 'pickup') {
      shippingFee = 0;
    } else if (accountType === 'Business') {
      shippingFee = getBusinessShippingFeeByDistrict(shippingAddress.district);
    } else {
      shippingFee = calculateShippingCost(shippingAddress.district);
    }
    // Calculate subtotal and customization total
    let subtotal = 0;
    let customizationTotal = 0;
    for (const item of orderItems) {
      subtotal += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
      customizationTotal += (parseFloat(item.customizationFee) || 0) * (parseInt(item.quantity) || 1);
    }
    let baseTotal = subtotal + customizationTotal + shippingFee;
    let businessDiscount = 0;
    if (accountType === 'Business') {
      businessDiscount = Math.round((baseTotal * 0.10) * 100) / 100;
    }
    let finalTotal = baseTotal - businessDiscount;
    
    // Use finalTotal for order totalAmount
    const newOrder = await Order.create({
      order_id: orderId,
      c_id: customerId,
      orderStatus: paymentInfo.method === 'cod' ? 'Pending' : 'Awaiting Payment',
      totalAmount: finalTotal,
      paymentStatus: paymentInfo.method === 'cod' ? 'Pending' : 'Awaiting',
      shippingMethodId: null,
      orderDate: new Date(),
      customerName: customerName,
      customized: orderItems.some(item => item.customization) ? 'yes' : 'no',
      paymentMethod: paymentInfo.method,
      wholesaleDiscount: accountType === 'Business' ? 'yes' : 'no'
    }, { transaction });
    
    for (const item of orderItems) {
      await OrderDetail.create({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
        customization: item.customization || null,
        customization_fee: item.customizationFee || 0,
        original_price: item.originalPrice || item.price
      }, { transaction });
      
      try {
        const inventory = await Inventory.findOne({ 
          where: { product_id: item.productId } 
        });
        
        if (inventory) {
          if (inventory.quantity < item.quantity) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: `Not enough inventory for product ID: ${item.productId}`
            });
          }
          
          await inventory.update({
            quantity: inventory.quantity - item.quantity,
            last_updated: new Date()
          }, { transaction });
        }
        
        if (item.variationId) {
          const variation = await ProductVariation.findByPk(item.variationId);
          if (variation) {
            if (variation.stock_level < item.quantity) {
              await transaction.rollback();
              return res.status(400).json({
                success: false, 
                message: `Not enough stock for variation ID: ${item.variationId}`
              });
            }
            
            await variation.update({
              stock_level: variation.stock_level - item.quantity
            }, { transaction });
          }
        }
        
        const productEntry = await ProductEntry.findOne({
          where: { product_id: item.productId }
        });
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
      }
    }
    
    try {
      let shippingMethodRecord;
      
      if (shippingMethod === 'pickup') {
        shippingMethodRecord = await ShippingMethod.findOne({ 
          where: { method_name: 'Store Pickup' }
        });
        
        if (!shippingMethodRecord) {
          try {
            shippingMethodRecord = await ShippingMethod.create({
              method_name: 'Store Pickup',
              price: 0.00
            }, { transaction });
          } catch (createError) {
            console.error('Error creating pickup shipping method:', createError);
            shippingMethodRecord = await ShippingMethod.findOne({ 
              where: { method_name: 'Store Pickup' }
            });
          }
        }
      } else {
        shippingMethodRecord = await ShippingMethod.findOne({ 
          where: { method_name: 'Standard Delivery' }
        });
        
        if (!shippingMethodRecord) {
          try {
            shippingMethodRecord = await ShippingMethod.create({
              method_name: 'Standard Delivery',
              price: calculateShippingCost(shippingAddress?.district || 'Unknown')
            }, { transaction });
          } catch (createError) {
            console.error('Error creating standard shipping method:', createError);
            shippingMethodRecord = await ShippingMethod.findOne({ 
              where: { method_name: 'Standard Delivery' }
            });
          }
        }
      }
      
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
    }
    
    try {
      const transactionRecord = await Transaction.create({
        order_id: orderId,
        c_id: customerId,
        amount: orderSummary.total,
        paymentMethod: paymentInfo.method,
        transactionDate: new Date(),
        transactionStatus: paymentInfo.method === 'cod' ? 'pending' : 'awaiting_payment',
        paymentGateway: paymentInfo.method === 'card' ? 'stripe' : 'manual',
        gatewayTransactionId: null,
        currency: 'LKR',
        notes: `Order placed via website. ${paymentInfo.method === 'cod' ? 'Cash on Delivery payment.' : ''}`
      }, { transaction });
      
      console.log(`Transaction created with ID: ${transactionRecord.transaction_id}`);
    } catch (error) {
      console.error('Error creating transaction record:', error);
    }
    
    try {
      if (paymentInfo.method !== 'cod') {
        let existingPaymentMethod = null;
        
        if (customerId) {
          existingPaymentMethod = await PaymentMethod.findOne({
            where: {
              c_id: customerId,
              methodType: paymentInfo.method
            }
          });
          
          const paymentDetails = {};
          if (paymentInfo.method === 'card' && paymentInfo.cardDetails) {
            paymentDetails.lastFour = paymentInfo.cardDetails.cardNumber.slice(-4);
            paymentDetails.brand = detectCardBrand(paymentInfo.cardDetails.cardNumber);
            
            if (paymentInfo.cardDetails.expiry && paymentInfo.cardDetails.expiry.includes('/')) {
              const [month, year] = paymentInfo.cardDetails.expiry.split('/');
              paymentDetails.expiryMonth = month.trim();
              paymentDetails.expiryYear = year.trim();
            }
          }
          
          if (!existingPaymentMethod) {
            await PaymentMethod.create({
              c_id: customerId,
              methodType: paymentInfo.method,
              isDefault: true,
              details: paymentDetails
            }, { transaction });
            
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
            await existingPaymentMethod.update({
              isDefault: true,
              details: { ...existingPaymentMethod.details, ...paymentDetails }
            }, { transaction });
            
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
    }
    
    try {
      if (customerId) {
        const customer = await Customer.findByPk(customerId);
        
        if (customer) {
          const currentOrderCount = customer.totalOrders || 0;
          const currentSpent = parseFloat(customer.totalSpent || 0);
          
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
    }
    
    let paymentUrl = null;
    
    await transaction.commit();
    
    try {
      const orderWithDetails = await Order.findOne({
        where: { order_id: orderId },
        include: [{ 
          model: OrderDetail, 
          as: 'orderDetails' 
        }]
      });
      
      if (orderWithDetails) {
        const customerEmail = customerInfo?.email || 
          (user?.email) || 
          (await Customer.findByPk(customerId))?.email;
        
        if (customerEmail) {
          const emailOrderData = {
            ...orderWithDetails.toJSON(),
            customerEmail,
            shippingFee: orderSummary.shippingFee
          };
          
          const { sendInvoiceEmail } = require('../../utils/emailService');
          
          console.log(`Attempting to send invoice email to ${customerEmail}`);
          
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
            });
        } else {
          console.log(`No customer email found to send invoice for order ${orderId}`);
        }
      } else {
        console.log(`Could not find order details for invoice email for order ${orderId}`);
      }
    } catch (emailError) {
      console.error('Error preparing invoice email:', emailError);
    }
    
    return res.status(201).json({
      success: true,
      orderId,
      paymentUrl,
      message: 'Order placed successfully',
      wholesaleDiscount: accountType === 'Business' ? 'yes' : 'no',
      shippingFee,
      businessDiscount
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

function detectCardBrand(cardNumber) {
  const cleanedNumber = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleanedNumber)) return 'Visa';
  if (/^(5[1-5])/.test(cleanedNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanedNumber)) return 'American Express';
  if (/^(6011|65|64[4-9]|622)/.test(cleanedNumber)) return 'Discover';
  
  return 'Unknown';
}

function calculateShippingCost(district) {
  const standardRate = 350;
  const highRateDistricts = ['Colombo', 'Gampaha', 'Kalutara'];
  
  if (!district) return standardRate;
  
  return highRateDistricts.includes(district) ? standardRate + 100 : standardRate;
}

// --- Business shipping fee logic ---
const businessDistrictShippingFees = {
  'Colombo': 3000,
  'Gampaha': 3000,
  'Kalutara': 3000,
  'Kandy': 3000,
  'Matale': 3000,
  'Nuwara Eliya': 3000,
  'Galle': 3000,
  'Matara': 3000,
  'Hambantota': 3000,
  'Jaffna': 2000,
  'Kilinochchi': 2000,
  'Mannar': 2000,
  'Vavuniya': 2000,
  'Mullaitivu': 2000,
  'Batticaloa': 2100,
  'Ampara': 2100,
  'Trincomalee': 2100,
  'Kurunegala': 2500,
  'Puttalam': 2500,
  'Anuradhapura': 2500,
  'Polonnaruwa': 2500,
  'Badulla': 2000,
  'Monaragala': 2000,
  'Ratnapura': 2400,
  'Kegalle': 2400
};
function getBusinessShippingFeeByDistrict(district) {
  return businessDistrictShippingFees[district] || 350;
}

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
    
    await Order.update({
      paymentStatus: paymentStatus,
      orderStatus: paymentStatus === 'completed' ? 'processing' : 'awaiting_payment',
      updated_at: new Date()
    }, {
      where: { order_id: orderId },
      transaction: sqlTransaction
    });
    
    try {
      const existingTransaction = await Transaction.findOne({
        where: { order_id: orderId }
      });
      
      if (existingTransaction) {
        await existingTransaction.update({
          transactionStatus: paymentStatus,
          gatewayTransactionId: transactionId || existingTransaction.gatewayTransactionId,
          notes: existingTransaction.notes + ` Payment status updated to ${paymentStatus}.`
        }, { transaction: sqlTransaction });
        
        if (existingTransaction.paymentMethod && paymentStatus === 'completed') {
          const paymentMethod = await PaymentMethod.findOne({
            where: {
              c_id: existingTransaction.c_id,
              methodType: existingTransaction.paymentMethod
            }
          });
          
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
        }
      }
    } catch (error) {
      console.error('Error updating transaction record:', error);
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