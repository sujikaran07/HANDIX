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
router.get('/verify-email', verifyEmail); 
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP); 
router.post('/verify-manual', verifyManually); 
router.get('/:c_id', getCustomerById);
router.post('/', createCustomer);
router.put('/:c_id', updateCustomer);
router.delete('/:c_id', deleteCustomer);
router.put('/:c_id/approve', approveCustomer);  
router.put('/:c_id/reject', rejectCustomer);  
router.post('/admin/create', createCustomerByAdmin);

module.exports = router;
