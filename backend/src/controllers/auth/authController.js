const { Customer } = require('../../models/customerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find customer by email
    const customer = await Customer.findOne({ where: { email } });
    
    // Check if customer exists
    if (!customer) {
      console.log(`Login failed: Customer with email ${email} not found`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Debug log
    console.log(`Login attempt for ${email}: Found customer ${customer.c_id}`);
    
    // Skip verification check for admin-created customers, which are already verified
    if (!customer.isEmailVerified) {
      console.log(`Login failed: Email ${email} not verified`);
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        reason: 'unverified',
        email: customer.email
      });
    }
    
    // Check if account is approved - wholesale accounts need approval regardless of who added them
    if (customer.accountType === 'Wholesale' && customer.accountStatus !== 'Approved') {
      console.log(`Login failed: Wholesale account ${email} not approved yet`);
      return res.status(403).json({
        message: 'Your account is pending approval',
        reason: 'pending',
        accountStatus: customer.accountStatus
      });
    }
    
    // Debug: check stored password format
    console.log('Stored password hash:', customer.password.substring(0, 20) + '...');
    console.log('Password format valid:', customer.password.startsWith('$2b$') || customer.password.startsWith('$2a$'));
    
    // For admin-added and retail accounts, ensure they're approved
    if ((customer.addedByAdmin || customer.isEmailVerified) && 
        customer.accountType === 'Retail' && 
        customer.accountStatus !== 'Approved') {
      customer.accountStatus = 'Approved';
      await customer.save();
      console.log(`Auto-approved account ${email}`);
    }
    
    let isPasswordValid = false;
    
    // First try normal bcrypt comparison
    try {
      isPasswordValid = await bcrypt.compare(password, customer.password);
      console.log('Password comparison result:', isPasswordValid);
    } catch (hashError) {
      console.error('Bcrypt comparison error:', hashError);
    }
    
    // If bcrypt comparison failed and we're in development, try direct comparison
    if (!isPasswordValid && process.env.NODE_ENV !== 'production') {
      console.log('Trying direct password comparison as fallback');
      
      // As a fallback for development, check if password was stored in plaintext
      if (password === customer.password) {
        console.log('WARNING: Direct password match - updating to secure hash');
        isPasswordValid = true;
        
        // Fix the password by properly hashing it
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(password, salt);
        await customer.save();
        console.log('Password properly hashed and saved');
      } else {
        console.log('Direct password comparison also failed');
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: customer.c_id,
        email: customer.email,
        accountType: customer.accountType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return success with user data (excluding sensitive fields)
    const { password: pwd, verificationToken, verificationExpires, ...userWithoutSensitiveData } = customer.toJSON();
    
    console.log(`Login successful for ${email}`);
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutSensitiveData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  // Implement if needed for email verification resending
  res.status(501).json({ message: 'Not implemented yet' });
};
