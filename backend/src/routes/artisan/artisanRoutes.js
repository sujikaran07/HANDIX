const express = require('express');
const { 
  getAllArtisans, 
  getArtisanById, 
  getArtisanWorkload, 
  assignOrderToArtisan
} = require('../../controllers/artisan/artisanController');
const { getAssignableOrders } = require('../../controllers/orders/orderController');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');
const { 
  getEmployeeProfile, 
  updateEmployeeProfile, 
  updateProfilePicture, 
  changePassword 
} = require('../../controllers/employees/settingsController');
const { upload } = require('../../utils/cloudinaryConfig');

const router = express.Router();

// Get all artisans
router.get('/', getAllArtisans);

// Get orders that can be assigned to artisans
router.get('/assignable-orders', getAssignableOrders);

// Get specific artisan by ID
router.get('/:id', getArtisanById);

// Get workload information for a specific artisan
router.get('/:id/workload', getArtisanWorkload);

// Assign an order to an artisan
router.put('/assign-order/:orderId', assignOrderToArtisan);

// Settings routes - reuse employee controllers but with role check for artisans
router.get('/settings/profile', authMiddleware, getEmployeeProfile);
router.put('/settings/profile', authMiddleware, updateEmployeeProfile);
router.put('/settings/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);
router.put('/settings/password', authMiddleware, changePassword);

// You can add more artisan-specific routes here

module.exports = router;
