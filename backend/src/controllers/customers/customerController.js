const { Customer } = require('../../models/customerModel');  
const { Address } = require('../../models/addressModel');
const { Order } = require('../../models/orderModel');
const { sequelize } = require('../../config/db');
const { Op } = require('sequelize');  
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 

const getAllCustomers = async (req, res) => {
  try {
    
    const customers = await Customer.findAll({
      attributes: { 
        exclude: ['addedByAdmin'] 
      },
      order: [['c_id', 'ASC']] 
    });
    res.json(customers);  
  } catch (error) {
    console.error('Error fetching customers:', error);  
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.c_id, {
      include: [
        { model: Address, as: 'addresses' },
        { model: Order, as: 'customerOrders' }
      ]
    });

    if (customer) {
      const billingOrShippingAddress = customer.addresses?.[0];
      customer.country = billingOrShippingAddress?.country || customer.country || 'N/A';
      customer.registrationDate = customer.createdAt;

      const orders = await Order.findAll({ 
        where: { c_id: req.params.c_id },
        attributes: ['total_amount']
      });

      const totalOrders = orders.length; 
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

      customer.dataValues.total_spent = totalSpent.toFixed(2);
      customer.dataValues.totalSpent = totalSpent.toFixed(2);
    
      customer.total_spent = totalSpent.toFixed(2);
      customer.totalSpent = totalSpent.toFixed(2);
      
      customer.total_orders = totalOrders || 0;
      customer.totalOrders = totalOrders || 0;

      if (orders.length > 0) {
        const lastOrder = await Order.findOne({
          where: { c_id: req.params.c_id },
          order: [['order_date', 'DESC']]
        });
        
        if (lastOrder) {
          customer.last_order_date = lastOrder.orderDate;
          customer.lastOrderDate = lastOrder.orderDate;
        }
      }

      console.log('Customer data being sent:', JSON.stringify({
        ...customer.toJSON(),
        total_spent: customer.total_spent,
        totalSpent: customer.totalSpent
      }, null, 2)); 
      
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const createCustomer = async (req, res) => {
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

    const verificationOTP = generateOTP();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); 
    
    customerData.verificationToken = verificationOTP; 
    customerData.verificationExpires = verificationExpires;
    customerData.isEmailVerified = false; 
    
    customerData.accountStatus = 'Pending';

    if (customerData.addresses && customerData.addresses.length > 0) {
      customerData.country = customerData.addresses[0].country; 
    }

    let originalPassword = null;

    if (customerData.password) {
      
      originalPassword = String(customerData.password).trim();
      
      console.log('Registration password hashing:');
      console.log('- Original password:', originalPassword);
      console.log('- Password type:', typeof originalPassword);
      console.log('- Password length:', originalPassword.length);
      
      const salt = await bcrypt.genSalt(10);
      customerData.password = await bcrypt.hash(originalPassword, salt);
      
      console.log('- Generated hash:', customerData.password);
    }

    const customer = await Customer.create(customerData, { include: [{ model: Address, as: 'addresses' }] });
    
    if (originalPassword) {
      try {
        const verifyPassword = await bcrypt.compare(originalPassword, customer.password);
        console.log('VERIFICATION TEST:', verifyPassword ? 'SUCCESS' : 'FAILED');
        
        if (!verifyPassword) {
          console.log('⚠️ Initial verification failed - attempting fix');
         
          const newSalt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(originalPassword, newSalt);
        
          await Customer.update({ password: newHash }, {
            where: { c_id: customer.c_id }
          });
          
          console.log('💡 Password hash fixed in database');
         
          const refreshedCustomer = await Customer.findByPk(customer.c_id);
          const secondVerify = await bcrypt.compare(originalPassword, refreshedCustomer.password);
          console.log('SECOND VERIFICATION TEST:', secondVerify ? 'SUCCESS' : 'FAILED');
        }
      } catch (verifyError) {
        console.error('Password verification error:', verifyError);
      }
    }
   
    console.log(`🔐 OTP for ${customerData.email}: ${verificationOTP} (valid for 15 minutes)`);

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        dkim: process.env.DKIM_PRIVATE_KEY ? {
          domainName: process.env.EMAIL_DOMAIN || 'handix.com',
          keySelector: 'default',
          privateKey: process.env.DKIM_PRIVATE_KEY
        } : undefined
      });

      await transporter.sendMail({
        from: {
          name: process.env.EMAIL_SENDER_NAME || 'Handix Store',
          address: process.env.EMAIL_USER
        },
        to: customerData.email,
        subject: "Your Verification Code - Handix",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333;">Handix</h1>
            </div>
            
            <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
            
            <p style="margin-bottom: 15px;">Hi ${customerData.firstName},</p>
            
            <p style="margin-bottom: 15px;">Thank you for creating a Handix account. Your verification code is:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block;">
                ${verificationOTP}
              </div>
            </div>
            
            <p style="margin-bottom: 15px;">This code is valid for 15 minutes.</p>
            
            <p style="margin-bottom: 15px;">If you did not create an account with us, you can safely ignore this email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Handix Store. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Hi ${customerData.firstName},\n\nYour verification code is: ${verificationOTP}\n\nThis code is valid for 15 minutes.\n\nThank you,\nHandix Team`
      });
      
      console.log(`Verification email with OTP sent to ${customerData.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.log('✅ Use the OTP code printed above for testing');
    }
    
    const { password, verificationToken, ...safeData } = customer.toJSON();
    
    res.status(201).json({ 
      ...safeData,
      message: 'Registration successful! Check your email for verification code.',
      email: customerData.email,
      otpForTesting: process.env.NODE_ENV === 'production' ? undefined : verificationOTP
    });
    
  } catch (error) {
    console.error('Error creating customer:', error);
 
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        message: 'A user with this email already exists',
        error: 'Email already registered'
      });
    }
    
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

const createCustomerByAdmin = async (req, res) => {
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
    
 
    customerData.isEmailVerified = true;
    customerData.verificationToken = null;
    customerData.verificationExpires = null;
    
    if (customerData.accountType === 'Retail') {
      customerData.accountStatus = 'Approved';
    }

    if (customerData.password) {
      const salt = await bcrypt.genSalt(10);
      customerData.password = await bcrypt.hash(customerData.password, salt);
    }
    

    const customer = await Customer.create(customerData, { 
      include: [{ model: Address, as: 'addresses' }] 
    });
    
    console.log(`Admin created customer ${customer.c_id} (${customerData.email}) - Auto-verified`);
    
    const { password, ...safeData } = customer.toJSON();
    
    res.status(201).json({
      ...safeData,
      message: 'Customer created successfully by admin',
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

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    const customer = await Customer.findOne({
      where: {
        email,
        verificationToken: otp,
        verificationExpires: { [Op.gt]: new Date() } 
      }
    });
    
    if (!customer) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    if (customer.password && customer.password.startsWith('$2')) {
      try {

        if (process.env.NODE_ENV !== 'production' && req.body.testPassword) {
          const isValid = await bcrypt.compare(req.body.testPassword, customer.password);
          console.log(`Test password verification: ${isValid ? 'VALID' : 'INVALID'}`);
          
          if (!isValid && process.env.NODE_ENV !== 'production') {
            console.log('Attempting to fix invalid hash during verification');
            
            const newSalt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(req.body.testPassword, newSalt);
            customer.password = newHash;
       
          }
        }
      } catch (e) {
        console.error('Password verification test error:', e);
      }
    }

    customer.isEmailVerified = true;
    if (['Personal', 'personal', 'Retail', 'retail'].includes(customer.accountType)) {
      customer.accountStatus = 'Approved';
    } else {
      customer.accountStatus = 'Pending';
    }
  
    customer.verificationToken = null;
    customer.verificationExpires = null;
    
    await customer.save();
    
    res.json({ 
      message: 'Email verified successfully! You can now log in.',
      status: 'success',
      accountType: customer.accountType,
      accountStatus: customer.accountStatus
    });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

const verifyManually = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const customer = await Customer.findOne({ where: { email } });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customer.isEmailVerified = true;
    
    if (customer.accountType === 'Retail') {
      customer.accountStatus = 'Approved';
    }
   
    customer.verificationToken = null;
    customer.verificationExpires = null;
    
    await customer.save();
    
    res.json({ 
      message: 'Manual email verification successful!',
      accountType: customer.accountType,
      isApproved: customer.accountStatus === 'Approved'
    });
  } catch (error) {
    console.error('Error during manual verification:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      return res.status(400).json({ message: 'Invalid verification request' });
    }
  
    const customer = await Customer.findOne({
      where: {
        email,
        verificationToken: token,
        verificationExpires: { [Op.gt]: new Date() } 
      }
    });
    
    if (!customer) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification link. Please request a new verification code.' 
      });
    }
    
    customer.isEmailVerified = true;
    
    if (customer.accountType === 'Retail') {
      customer.accountStatus = 'Approved';
    }
    customer.verificationToken = null;
    customer.verificationExpires = null;
    
    await customer.save();
    
    res.json({ 
      message: 'Email verification successful! You can now log in.',
      accountType: customer.accountType,
      isApproved: customer.accountStatus === 'Approved'
    });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { country, ...updateData } = req.body; 
    const [updated] = await Customer.update(updateData, {
      where: { c_id: req.params.c_id }
    });

    if (updated) {
      const updatedCustomer = await Customer.findByPk(req.params.c_id);
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { c_id: req.params.c_id }  
    });
    if (deleted) {
      res.status(204).json();  
    } else {
      res.status(404).json({ message: 'Customer not found' });  
    }
  } catch (error) {
    console.error('Error deleting customer:', error);  
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};

const approveCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update({ accountStatus: 'Approved' }, {
      where: { c_id: req.params.c_id }
    });

    if (updated) {
      const updatedCustomer = await Customer.findByPk(req.params.c_id);
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error approving customer:', error);
    res.status(500).json({ message: 'Error approving customer', error: error.message });
  }
};

const rejectCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update({ accountStatus: 'Rejected' }, {
      where: { c_id: req.params.c_id }
    });

    if (updated) {
      const updatedCustomer = await Customer.findByPk(req.params.c_id);
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error rejecting customer:', error);
    res.status(500).json({ message: 'Error rejecting customer', error: error.message });
  }
};

const getAllCustomersWithDetails = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: { 
        exclude: ['addedByAdmin'] 
      },
      include: [
        { model: Address, as: 'addresses' }, 
        { model: Order, as: 'customerOrders' } 
      ],
      order: [['c_id', 'ASC']]
    });
    console.log('Fetched customers with details:', JSON.stringify(customers, null, 2)); 
    res.json(customers); 
  } catch (error) {
    console.error('Error fetching customers with details:', error);
    res.status(500).json({ message: 'Error fetching customers with details', error: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const customer = await Customer.findOne({ where: { email } });
    
    if (!customer) {
      return res.status(200).json({ message: 'If your email exists in our system, a new code has been sent' });
    }
    
    if (customer.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please log in.' });
    }
    
    const newOTP = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); 
    
    customer.verificationToken = newOTP;
    customer.verificationExpires = otpExpires;
    await customer.save();
    
    console.log(`🔄 New OTP for ${email}: ${newOTP}`);
    
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: {
          name: process.env.EMAIL_SENDER_NAME || 'Handix Store',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: "Your New Verification Code - Handix",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Your New Verification Code</h2>
            
            <p style="margin-bottom: 15px;">Here is your new verification code:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block;">
                ${newOTP}
              </div>
            </div>
            
            <p style="margin-bottom: 15px;">This code is valid for 15 minutes.</p>
          </div>
        `,
        text: `Your new verification code is: ${newOTP}\n\nThis code is valid for 15 minutes.`
      });
      
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
    
    res.json({ 
      message: 'New verification code sent to your email',
      otpForTesting: process.env.NODE_ENV === 'production' ? undefined : newOTP
    });
    
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
};

const toggleCustomerStatus = async (req, res) => {
  try {
    const { c_id } = req.params;
    const customer = await Customer.findByPk(c_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    let newStatus;
    if (customer.accountStatus === 'Approved' || customer.accountStatus === 'Active') {
      newStatus = 'Deactivated';
    } else {
      newStatus = 'Approved';
    }
    customer.accountStatus = newStatus;
    await customer.save();
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling customer status', error: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  approveCustomer,
  rejectCustomer,
  getAllCustomersWithDetails,
  verifyEmail,
  verifyOTP,
  resendOTP,
  verifyManually,
  createCustomerByAdmin,
  toggleCustomerStatus,
};
