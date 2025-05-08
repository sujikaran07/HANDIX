const express = require('express');
const {
  getAllAdminProducts,
  updateAdminProductStatus,
  deleteAdminProduct,
} = require('../../controllers/admin/adminProductController');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

const router = express.Router();

router.get('/', authMiddleware, getAllAdminProducts); 
router.put('/:id/status', authMiddleware, updateAdminProductStatus);
router.delete('/:id', authMiddleware, deleteAdminProduct); 

// Optional specific status endpoints for more semantic API
router.put('/:id/approve', authMiddleware, (req, res) => {
  req.body.status = 'Approved';
  return updateAdminProductStatus(req, res);
});

router.put('/:id/reject', authMiddleware, (req, res) => {
  req.body.status = 'Rejected';
  return updateAdminProductStatus(req, res);
});

router.put('/:id/restore', authMiddleware, (req, res) => {
  req.body.status = 'Pending';
  return updateAdminProductStatus(req, res);
});

module.exports = router;
