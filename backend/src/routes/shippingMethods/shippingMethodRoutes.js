const express = require('express');
const { ShippingMethod } = require('../../models/shippingMethodModel');
const router = express.Router();

// Get all shipping methods
router.get('/', async (req, res) => {
  try {
    const shippingMethods = await ShippingMethod.findAll();
    res.json(shippingMethods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({ message: 'Error fetching shipping methods', error: error.message });
  }
});

// Get shipping method by ID
router.get('/:id', async (req, res) => {
  try {
    const shippingMethod = await ShippingMethod.findByPk(req.params.id);
    if (shippingMethod) {
      res.json(shippingMethod);
    } else {
      res.status(404).json({ message: 'Shipping method not found' });
    }
  } catch (error) {
    console.error('Error fetching shipping method:', error);
    res.status(500).json({ message: 'Error fetching shipping method', error: error.message });
  }
});

module.exports = router;
