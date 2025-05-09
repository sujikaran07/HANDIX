const { Customer } = require('../../models/customerModel');
const { Address } = require('../../models/addressModel'); 
const { ProfileImage } = require('../../models/profileImageModel'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for ${email}`);
   
    const customer = await Customer.findOne({ 
      where: { email },
      include: [{ model: Address, as: 'addresses' }]
    });

    if (!customer) {
      console.log(`Login failed: Customer with email ${email} not found`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!customer.isEmailVerified) {
      console.log(`Login failed: Email ${email} not verified`);
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        reason: 'unverified',
        email: customer.email
      });
    }
    
    if (customer.accountType === 'Wholesale' && customer.accountStatus !== 'Approved') {
      console.log(`Login failed: Wholesale account ${email} not approved yet`);
      return res.status(403).json({
        message: 'Your account is pending approval',
        reason: 'pending',
        accountStatus: customer.accountStatus
      });
    }
    
    if (customer.accountType === 'Retail' && customer.accountStatus !== 'Approved') {
      customer.accountStatus = 'Approved';
      await customer.save();
    }
    
    console.log('LOGIN ATTEMPT - IMPORTANT DEBUG INFO:');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('Stored hash:', customer.password);
    console.log('Password value:', process.env.NODE_ENV === 'production' ? '[REDACTED]' : password);
    
    
    const passwordAttempts = [
      String(password || ''),            
      String(password || '').trim(),     
      `${String(password || '')}`,        
      `${String(password || '').trim()}`  
    ];
    
    let isPasswordValid = false;
    let successMethod = '';
    
    for (const attempt of passwordAttempts) {
      try {
        const result = await bcrypt.compare(attempt, customer.password);
        console.log(`Password attempt (${attempt.length} chars): ${result ? 'SUCCESS ✓' : 'FAILED ✗'}`);
        if (result) {
          isPasswordValid = true;
          successMethod = `String length ${attempt.length}`;
          break;
        }
      } catch (error) {
        console.error('bcrypt comparison error:', error);
      }
    }
    
    if (!isPasswordValid) {
      console.log('All password validation methods failed');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log(`Login successful using method: ${successMethod}`);

    const token = jwt.sign(
      { 
        id: customer.c_id,
        email: customer.email,
        accountType: customer.accountType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    let profileImage = null;
    try {
      const profileImageRecord = await ProfileImage.findOne({
        where: { c_id: customer.c_id }
      });
      
      if (profileImageRecord) {
        profileImage = profileImageRecord.image_url;
      }
    } catch (imageError) {
      console.error('Error fetching profile image:', imageError);
    }
    
    const { password: pwd, verificationToken, verificationExpires, ...userWithoutSensitiveData } = customer.toJSON();

    userWithoutSensitiveData.profilePicture = profileImage;
    
    if (customer.addresses && customer.addresses.length > 0) {
      const primaryAddress = customer.addresses[0];
      const addressParts = [
        primaryAddress.street_address,
        primaryAddress.district, 
        primaryAddress.country
      ].filter(Boolean);
      
      userWithoutSensitiveData.address = addressParts.join(', ');
    }
    
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

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    mail
    const customer = await Customer.findOne({ where: { email } });
    
    if (!customer) {
      console.log(`Forgot password request for non-existent email: ${email}`);
      return res.status(200).json({ 
        message: 'If your email exists in our system, a password reset code has been sent' 
      });
    }
    
    const resetOTP = generateOTP();
    const resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); 
    
    try {

      customer.resetPasswordToken = resetOTP;
      customer.resetPasswordExpires = resetOTPExpires;
      await customer.save();
      
      console.log(`🔑 Reset OTP for ${email}: ${resetOTP} (valid for 15 minutes)`);
    } catch (dbError) {

      console.error('Database error when saving reset token:', dbError.message);
      console.log('💡 Use this SQL to add required columns:');
      console.log('ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS "reset_password_token" VARCHAR(255), ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP;');
      
      if (!global.passwordResetTokens) {
        global.passwordResetTokens = {};
      }
      
      global.passwordResetTokens[email] = {
        otp: resetOTP,
        expires: resetOTPExpires
      };
      
      console.log(`⚠️ Database columns missing - using memory storage for OTP: ${resetOTP}`);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
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
        subject: "Password Reset Code - Handix",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333;">Handix</h1>
            </div>
            
            <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
            
            <p style="margin-bottom: 15px;">Hello,</p>
            
            <p style="margin-bottom: 15px;">We received a request to reset your password. Your verification code is:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block;">
                ${resetOTP}
              </div>
            </div>
            
            <p style="margin-bottom: 15px;">This code is valid for 15 minutes.</p>
            
            <p style="margin-bottom: 15px;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        `,
        text: `We received a request to reset your password. Your verification code is: ${resetOTP}\n\nThis code is valid for 15 minutes.\n\nIf you did not request this, you can safely ignore this email.`
      });
      
      console.log(`Password reset email with OTP sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      console.log('✅ Use the OTP code printed above for testing');
    }
    
    res.status(200).json({ 
      message: 'If your email exists in our system, a password reset code has been sent',
      email: email, 
      otpForTesting: process.env.NODE_ENV === 'production' ? undefined : resetOTP
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request', error: error.message });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    let customer = null;
    let otpValid = false;
    
    try {
      customer = await Customer.findOne({
        where: {
          email,
          resetPasswordToken: otp,
          resetPasswordExpires: { [Op.gt]: new Date() }
        }
      });
      
      if (customer) {
        otpValid = true;
      }
    } catch (dbError) {
      console.error('Error querying reset token from database:', dbError.message);
      console.log('Checking memory storage as fallback...');
    }
    
    if (!otpValid && global.passwordResetTokens && global.passwordResetTokens[email]) {
      const memoryToken = global.passwordResetTokens[email];
      
      if (memoryToken.otp === otp && new Date(memoryToken.expires) > new Date()) {
        customer = await Customer.findOne({ where: { email } });
        otpValid = true;
        delete global.passwordResetTokens[email];
        console.log(`✅ Memory-stored OTP validated for ${email}`);
      }
    }
    
    if (!otpValid || !customer) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    const resetToken = jwt.sign(
      { id: customer.c_id, email: customer.email, purpose: 'reset-password' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ 
      message: 'Verification successful! You can now set a new password.',
      resetToken,
      email
    });
    
  } catch (error) {
    console.error('Reset OTP verification error:', error);
    res.status(500).json({ message: 'Error verifying reset code', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    if (decoded.purpose !== 'reset-password') {
      return res.status(401).json({ message: 'Invalid token purpose' });
    }
    
    const customer = await Customer.findOne({
      where: { c_id: decoded.id, email: decoded.email }
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    console.log('Resetting password for user:', customer.email);
    
    const passwordToHash = String(newPassword || '');
    console.log('Password input length:', passwordToHash.length);
   
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);
    console.log('Generated hash:', hashedPassword.substring(0, 20) + '...');
    
    await Customer.update(
      { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      { 
        where: { c_id: customer.c_id },
        individualHooks: false
      }
    );
    
    const updatedCustomer = await Customer.findOne({
      where: { c_id: decoded.id }
    });
    
    console.log('Updated hash in database:', updatedCustomer.password.substring(0, 20) + '...');
    
    const verifyTest = await bcrypt.compare(passwordToHash, updatedCustomer.password);
    console.log('Immediate verification test:', verifyTest ? 'PASSED ✓' : 'FAILED ✗');
    
    if (!verifyTest) {
      console.error('CRITICAL: Password verification failed immediately');
      return res.status(500).json({ message: 'Error creating secure password. Please try again.' });
    }
    
    console.log('Successfully reset password for', customer.email);
    console.log('New hash first 20 chars:', updatedCustomer.password.substring(0, 20));
    
    res.json({ 
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, email } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(401).json({ 
        message: 'Authentication failed', 
        reason: tokenError.name === 'TokenExpiredError' ? 'expired' : 'invalid' 
      });
    }
    
    const customer = await Customer.findOne({ 
      where: { 
        c_id: decoded.id,
        email: decoded.email 
      } 
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const currentPasswordStr = String(currentPassword || '').trim();
    let isCurrentPasswordValid = false;
    
    try {
      isCurrentPasswordValid = await bcrypt.compare(currentPasswordStr, customer.password);
      console.log('Current password valid:', isCurrentPasswordValid);
    } catch (hashError) {
      console.error('Bcrypt comparison error:', hashError);
    }
    
    if (!isCurrentPasswordValid && process.env.NODE_ENV !== 'production') {
      isCurrentPasswordValid = (currentPassword === customer.password);
      console.log('Direct password match:', isCurrentPasswordValid);
    }
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const newPasswordStr = String(newPassword || '').trim();
    const hashedPassword = await bcrypt.hash(newPasswordStr, 10);
    
    console.log('New password hash:', hashedPassword.substring(0, 20) + '...');
    console.log('Hash format valid:', hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2a$'));
    
    customer.password = hashedPassword;
    await customer.save();
    
    try {
      const verifyNew = await bcrypt.compare(newPassword, customer.password);
      console.log('Verify new password works with bcrypt:', verifyNew);
      
      if (!verifyNew) {
        console.error('WARNING: New password failed verification check!');
      }
    } catch (error) {
      console.error('Error verifying new password:', error);
    }
    
    console.log(`Password changed successfully for user ${customer.c_id}`);
    
    res.json({ 
      message: 'Password changed successfully',
      success: true
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

exports.fixAccountPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const customer = await Customer.findOne({ where: { email } });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const passwordToUse = newPassword || 'Password123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordToUse, salt);
    
    console.log('Setting new password hash:', hashedPassword);
    
    customer.password = hashedPassword;
    await customer.save();
    
    res.json({ 
      message: 'Password has been reset to: ' + passwordToUse,
      email: email,
      newPassword: passwordToUse
    });
  } catch (error) {
    console.error('Fix account error:', error);
    res.status(500).json({ message: 'Error fixing account', error: error.message });
  }
};
exports.testPasswordVerification = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not available in production' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const customer = await Customer.findOne({ where: { email } });
    
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const passwordStr = String(password).trim();
    const result = await bcrypt.compare(passwordStr, customer.password);
    
    res.json({
      success: result,
      details: {
        passwordLength: passwordStr.length,
        hashPrefix: customer.password.substring(0, 10),
        bcryptVersion: bcrypt.version || 'unknown',
      }
    });
    
  } catch (error) {
    console.error('Password test error:', error);
    res.status(500).json({ message: 'Error testing password', error: error.message });
  }
};

exports.emergencyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'This endpoint is not available in production' });
    }
    
    const customer = await Customer.findOne({ 
      where: { email },
      include: [{ model: Address, as: 'addresses' }]
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const hashedPassword = await bcrypt.hash(String(password), 10);
    
    customer.password = hashedPassword;
    await customer.save();
    
    const token = jwt.sign(
      { 
        id: customer.c_id,
        email: customer.email,
        accountType: customer.accountType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { password: pwd, verificationToken, verificationExpires, ...userWithoutSensitiveData } = customer.toJSON();
    
    res.json({
      message: 'Emergency login successful and password updated',
      token,
      user: userWithoutSensitiveData
    });
    
  } catch (error) {
    console.error('Emergency login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
