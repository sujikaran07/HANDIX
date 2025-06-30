const { Customer } = require('../../models/customerModel');
const { Address } = require('../../models/addressModel');
const bcrypt = require('bcrypt');

// Create a new customer by admin, auto-generates c_id if not provided
exports.createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Generate customer ID if not provided
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
    
    customerData.addedByAdmin = true;
    customerData.isEmailVerified = true;
    
    // Set account status for Retail accounts
    if (customerData.accountType === 'Retail') {
      customerData.accountStatus = 'Approved';
    }
    
    // Create customer and include addresses if provided
    const customer = await Customer.create(customerData, { 
      include: [{ model: Address, as: 'addresses' }] 
    });
   
    // Remove password from response
    const { password, ...safeData } = customer.toJSON();
    
    res.status(201).json({
      ...safeData,
      message: 'Customer created successfully by admin'
    });
    
  } catch (error) {
    console.error('Error creating customer by admin:', error);
    
    // Handle unique constraint error for email
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        message: 'A user with this email already exists',
        error: 'Email already registered'
      });
    }
    
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

