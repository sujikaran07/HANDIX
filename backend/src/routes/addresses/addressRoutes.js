const express = require('express');
const router = express.Router();
const { getAddressesByCustomerId, createAddress, updateAddress } = require('../../controllers/addresses/addressController');

// Get addresses for a customer
router.get('/customer/:c_id', getAddressesByCustomerId);

// Create new address
router.post('/', createAddress);

// Update address for customer
router.put('/customer/:c_id', updateAddress);

module.exports = router;
