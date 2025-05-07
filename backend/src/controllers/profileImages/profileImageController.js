const { ProfileImage } = require('../../models/profileImageModel');
const { Customer } = require('../../models/customerModel');
const { cloudinary } = require('../../utils/cloudinaryConfig');

// Upload a profile image
const uploadProfileImage = async (req, res) => {
  try {
    const { c_id } = req.params;
    const { image } = req.body; // Base64 image string

    // Validate customer exists
    const customer = await Customer.findByPk(c_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    // Upload image to Cloudinary
    console.log(`Uploading profile image for customer ${c_id} to Cloudinary`);
    
    // Upload the image to the 'profile_images' folder in Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'handix_profile_images',
      use_filename: false,
      unique_filename: true,
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
    });

    console.log('Image uploaded to Cloudinary:', uploadResult.secure_url);

    // Check if customer already has a profile image
    const existingImage = await ProfileImage.findOne({
      where: { c_id }
    });

    if (existingImage) {
      // If there's an existing image, update it
      existingImage.image_url = uploadResult.secure_url;
      await existingImage.save();
      console.log(`Updated profile image for customer ${c_id}`);
      res.json(existingImage);
    } else {
      // Create new profile image record
      const newProfileImage = await ProfileImage.create({
        c_id,
        image_url: uploadResult.secure_url
      });
      console.log(`Created new profile image for customer ${c_id}`);
      res.status(201).json(newProfileImage);
    }
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
};

// Get profile image for a customer
const getProfileImage = async (req, res) => {
  try {
    const { c_id } = req.params;

    const profileImage = await ProfileImage.findOne({
      where: { c_id }
    });

    if (profileImage) {
      res.json(profileImage);
    } else {
      res.status(404).json({ message: 'Profile image not found' });
    }
  } catch (error) {
    console.error('Error fetching profile image:', error);
    res.status(500).json({ message: 'Error fetching profile image', error: error.message });
  }
};

// Delete profile image
const deleteProfileImage = async (req, res) => {
  try {
    const { c_id } = req.params;

    const profileImage = await ProfileImage.findOne({
      where: { c_id }
    });

    if (!profileImage) {
      return res.status(404).json({ message: 'Profile image not found' });
    }

    // Extract public_id from the Cloudinary URL
    const publicId = profileImage.image_url.split('/').pop().split('.')[0];
    const folderPath = 'handix_profile_images/' + publicId;

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(folderPath);
    console.log(`Deleted image from Cloudinary: ${folderPath}`);

    // Delete record from database
    await profileImage.destroy();
    console.log(`Deleted profile image record for customer ${c_id}`);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Error deleting profile image', error: error.message });
  }
};

module.exports = {
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
};
