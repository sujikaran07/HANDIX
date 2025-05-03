const { Customer } = require('../../models/customerModel');
const { Address } = require('../../models/addressModel');
const bcrypt = require('bcrypt');

// Create a customer from admin panel
exports.createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    
    // Generate sequential customer ID if not provided
    if (!customerData.c_id) {
      const latestCustomer = await Customer.findOne({
        order: [['c_id', 'DESC']]
      });
      
      let nextId = 1;
      
      if (latestCustomer) {
        const latestIdNum = parseInt(latestCustomer.c_id.replace('C', ''), 10);
        if (!isNaN(latestIdNum)) {
          nextId = latestIdNum + 1;
        }
      }
      
      customerData.c_id = `C${nextId.toString().padStart(3, '0')}`;
    }
    
    // Mark that this customer was added by admin
    customerData.addedByAdmin = true;
    customerData.isEmailVerified = true;
    
    // Auto-approve Retail customers
    if (customerData.accountType === 'Retail') {
      customerData.accountStatus = 'Approved';
    }
    
    // Create customer
    const customer = await Customer.create(customerData, { 
      include: [{ model: Address, as: 'addresses' }] 
    });
    
    // Return success response (excluding sensitive data)
    const { password, ...safeData } = customer.toJSON();
    
    res.status(201).json({
      ...safeData,
      message: 'Customer created successfully by admin'
    });
    
  } catch (error) {
    console.error('Error creating customer by admin:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        message: 'A user with this email already exists',
        error: 'Email already registered'
      });
    }
    
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

// ...other admin customer management functions...
