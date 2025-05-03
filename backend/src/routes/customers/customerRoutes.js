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
  createCustomerByAdmin
} = require('../../controllers/customers/customerController');
const router = express.Router();

router.get('/', getAllCustomers);
router.get('/details', getAllCustomersWithDetails);
router.get('/verify-email', verifyEmail); // Keep for backward compatibility
router.post('/verify-otp', verifyOTP); // Add OTP verification
router.post('/resend-otp', resendOTP); // Add resend OTP
router.post('/verify-manual', verifyManually); // Add route for manual verification
router.get('/:c_id', getCustomerById);
router.post('/', createCustomer);
router.put('/:c_id', updateCustomer);
router.delete('/:c_id', deleteCustomer);
router.put('/:c_id/approve', approveCustomer);  
router.put('/:c_id/reject', rejectCustomer);  

// Admin customer creation route - this will bypass verification
router.post('/admin/create', createCustomerByAdmin);

module.exports = router;
