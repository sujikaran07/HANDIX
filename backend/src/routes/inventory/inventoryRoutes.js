const express = require('express');
const router = express.Router();
const { getInventory } = require('../../controllers/inventory/inventoryController');

router.get('/', getInventory);

module.exports = router;
