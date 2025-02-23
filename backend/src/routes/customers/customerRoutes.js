const express = require('express');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  approveCustomer,
  rejectCustomer
} = require('../../controllers/customers/customerController');
const router = express.Router();

router.get('/', getAllCustomers);
router.get('/:c_id', getCustomerById);
router.post('/', createCustomer);
router.put('/:c_id', updateCustomer);
router.delete('/:c_id', deleteCustomer);
router.put('/:c_id/approve', approveCustomer);  // Add route for approving customer
router.put('/:c_id/reject', rejectCustomer);  // Add route for rejecting customer

module.exports = router;
