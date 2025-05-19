const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'handix_categories', // Change folder for better organization
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      ...(isImage && { transformation: [{ width: 800, height: 800, crop: 'limit' }] }),
      ...(isPdf && { resource_type: 'raw' })
    };
  }
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  }
});

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'handix_products',
      use_filename: true,
      unique_filename: true,
    });
    
    return {
      public_id: result.public_id,
      image_url: result.secure_url,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary
};
