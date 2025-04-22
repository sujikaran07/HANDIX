const express = require('express');
const router = express.Router();
const { getInventory } = require('../../controllers/inventory/inventoryController');

router.get('/inventory', getInventory);

module.exports = router;
