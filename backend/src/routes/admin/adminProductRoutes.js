const express = require('express');
const {
  getAllAdminProducts,
  updateAdminProductStatus,
  deleteAdminProduct,
} = require('../../controllers/admin/adminProductController');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

const router = express.Router();

// Route: Get all admin products
router.get('/', authMiddleware, getAllAdminProducts); 

// Route: Update product status
router.put('/:id/status', authMiddleware, updateAdminProductStatus);

// Route: Delete a product
router.delete('/:id', authMiddleware, deleteAdminProduct); 

// Route: Approve a product
router.put('/:id/approve', authMiddleware, (req, res) => {
  req.body.status = 'Approved';
  return updateAdminProductStatus(req, res);
});

// Route: Reject a product
router.put('/:id/reject', authMiddleware, (req, res) => {
  req.body.status = 'Rejected';
  return updateAdminProductStatus(req, res);
});

// Route: Restore a product to Pending status
router.put('/:id/restore', authMiddleware, (req, res) => {
  req.body.status = 'Pending';
  return updateAdminProductStatus(req, res);
});

module.exports = router;
