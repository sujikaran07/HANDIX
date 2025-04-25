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

module.exports = router;
