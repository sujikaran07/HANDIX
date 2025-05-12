const { Employee } = require('../../models/employeeModel');
const EmployeeProfile = require('../../models/employeeProfileModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../../utils/cloudinaryConfig');

const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: EmployeeProfile, as: 'profile' }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        eId: employee.eId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        roleId: employee.roleId,
        profileUrl: employee.profile ? employee.profile.profileUrl : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update employee profile
// @route   PUT /api/employees/settings/profile
// @access  Private
const updateEmployeeProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, removeProfilePicture } = req.body;
    const employeeId = req.user.id;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update the employee details
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.phone = phone || employee.phone;

    await employee.save();

    // Handle profile picture removal if requested
    if (removeProfilePicture === true) {
      try {
        const profile = await EmployeeProfile.findOne({ where: { eId: employeeId } });
        
        if (profile && profile.profileUrl) {
          // If there's an existing profile picture in Cloudinary, delete it
          if (profile.profileUrl.includes('cloudinary')) {
            try {
              const publicId = profile.profileUrl.split('/').pop().split('.')[0];
              if (publicId) {
                await cloudinary.uploader.destroy(`handix_profiles/${publicId}`);
              }
            } catch (error) {
              console.log('Error deleting profile image from Cloudinary:', error);
            }
          }
          
          // Set a placeholder image URL instead of null to satisfy the notNull constraint
          profile.profileUrl = ''; // Using empty string instead of null
          await profile.save();
        }
      } catch (profileError) {
        console.error('Error removing profile picture:', profileError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to remove profile picture',
          error: profileError.message
        });
      }
    }

    // Fetch updated profile to get current profileUrl value
    const updatedProfile = await EmployeeProfile.findOne({ where: { eId: employeeId } });
    const profileUrl = updatedProfile ? updatedProfile.profileUrl : '';

    res.status(200).json({
      success: true,
      message: removeProfilePicture ? 'Profile updated and picture removed successfully' : 'Profile updated successfully',
      data: {
        eId: employee.eId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        profileUrl: profileUrl // Use the actual profileUrl from database
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const updateProfilePicture = async (req, res) => {
  try {    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const employeeId = req.user.id;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'handix_profiles',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    });

    // Remove the temporary file if it exists
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Find or create profile
    let profile = await EmployeeProfile.findOne({ where: { eId: employeeId } });

    if (profile) {
      // If there's an existing profile picture in Cloudinary, delete it
      if (profile.profileUrl && profile.profileUrl.includes('cloudinary')) {
        try {
          const publicId = profile.profileUrl.split('/').pop().split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`handix_profiles/${publicId}`);
          }
        } catch (error) {
          console.log('Error deleting old profile image:', error);
          // Continue with the update even if deletion fails
        }
      }
      
      // Update the profile with new image
      profile.profileUrl = result.secure_url;
      await profile.save();
    } else {
      // If profile doesn't exist, create it
      profile = await EmployeeProfile.create({
        eId: employeeId,
        profileUrl: result.secure_url
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileUrl: result.secure_url
      }
    });
  } catch (error) {
    console.error(error);
    
    // Remove the temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Change employee password
// @route   PUT /api/employees/settings/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
      // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    const employeeId = req.user.id;
    
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if current password matches
    const isMatch = await employee.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    employee.password = newPassword;
    await employee.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getEmployeeProfile,
  updateEmployeeProfile,
  updateProfilePicture,
  changePassword
};
