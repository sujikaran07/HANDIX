const express = require('express');
const {
  getAllAdminProducts,
  updateAdminProductStatus,
  deleteAdminProduct,
} = require('../../controllers/admin/adminProductController');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

const router = express.Router();

router.get('/', authMiddleware, getAllAdminProducts); // Fetch all products for admin
router.put('/:id/status', authMiddleware, updateAdminProductStatus); // Update product status
router.delete('/:id', authMiddleware, deleteAdminProduct); // Delete a product

module.exports = router;
