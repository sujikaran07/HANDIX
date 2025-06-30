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

// Route: Get all artisans
router.get('/', getAllArtisans);

// Route: Get orders that can be assigned to artisans
router.get('/assignable-orders', getAssignableOrders);

// Route: Get specific artisan by ID
router.get('/:id', getArtisanById);

// Route: Get workload information for a specific artisan
router.get('/:id/workload', getArtisanWorkload);

// Route: Assign an order to an artisan
router.put('/assign-order/:orderId', assignOrderToArtisan);

// Artisan settings/profile routes (protected)
router.get('/settings/profile', authMiddleware, getEmployeeProfile);
router.put('/settings/profile', authMiddleware, updateEmployeeProfile);
router.put('/settings/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);
router.put('/settings/password', authMiddleware, changePassword);

// ...add more artisan-specific routes here if needed

module.exports = router;
