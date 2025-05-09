const { Customer } = require('../../models/customerModel');
const { Address } = require('../../models/addressModel');
const bcrypt = require('bcrypt');

exports.createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

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
    
    if (customerData.accountType === 'Retail') {
      customerData.accountStatus = 'Approved';
    }
    
    const customer = await Customer.create(customerData, { 
      include: [{ model: Address, as: 'addresses' }] 
    });
   
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

