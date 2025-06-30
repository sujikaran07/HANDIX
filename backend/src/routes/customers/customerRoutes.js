const express = require('express');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  approveCustomer,
  rejectCustomer,
  getAllCustomersWithDetails,
  verifyEmail,
  verifyOTP,
  resendOTP,
  verifyManually,
  createCustomerByAdmin,
  toggleCustomerStatus
} = require('../../controllers/customers/customerController');
const router = express.Router();

// Route: Get all customers
router.get('/', getAllCustomers);

// Route: Get all customers with details (addresses, orders)
router.get('/details', getAllCustomersWithDetails);

// Route: Email verification (link)
router.get('/verify-email', verifyEmail);

// Route: Verify OTP for email
router.post('/verify-otp', verifyOTP);

// Route: Resend OTP for email verification
router.post('/resend-otp', resendOTP);

// Route: Manual verification (admin)
router.post('/verify-manual', verifyManually);

// Route: Get customer by ID
router.get('/:c_id', getCustomerById);

// Route: Create new customer (registration)
router.post('/', createCustomer);

// Route: Update customer by ID
router.put('/:c_id', updateCustomer);

// Route: Delete customer by ID
router.delete('/:c_id', deleteCustomer);

// Route: Approve customer account
router.put('/:c_id/approve', approveCustomer);

// Route: Reject customer account
router.put('/:c_id/reject', rejectCustomer);

// Route: Create customer by admin
router.post('/admin/create', createCustomerByAdmin);

// Route: Toggle customer status (active/deactivated)
router.put('/:c_id/status', toggleCustomerStatus);

module.exports = router;
