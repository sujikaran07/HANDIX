const express = require('express');
const router = express.Router();
const { getInventory } = require('../../controllers/inventory/inventoryController');

// Route: Get inventory for admin dashboard
router.get('/inventory', getInventory);

module.exports = router;
