const express = require('express');
const { Address } = require('../../models/addressModel');
const router = express.Router();

// Get all addresses
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.findAll();
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
});

// Get addresses by customer ID
router.get('/customer/:c_id', async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { c_id: req.params.c_id }
    });
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses for customer:', error);
    res.status(500).json({ message: 'Error fetching addresses for customer', error: error.message });
  }
});

// Get address by ID
router.get('/:address_id', async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.address_id);
    if (address) {
      res.json(address);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Error fetching address', error: error.message });
  }
});

// Create address
router.post('/', async (req, res) => {
  try {
    console.log('Creating address with data:', req.body);
    const address = await Address.create(req.body);
    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
});

// Update address - Fixed route
router.put('/:address_id', async (req, res) => {
  try {
    console.log(`Updating address ID ${req.params.address_id} with data:`, req.body);
    
    const [updated] = await Address.update(req.body, {
      where: { address_id: req.params.address_id }
    });
    
    if (updated) {
      const updatedAddress = await Address.findByPk(req.params.address_id);
      res.json(updatedAddress);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
});

// Delete address
router.delete('/:address_id', async (req, res) => {
  try {
    const deleted = await Address.destroy({
      where: { address_id: req.params.address_id }
    });
    
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
});

// Set address as default
router.put('/:address_id/default', async (req, res) => {
  try {
    // Get the customer ID from the address
    const address = await Address.findByPk(req.params.address_id);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    const c_id = address.c_id;
    
    // Clear default status from all customer's addresses
    await Address.update({ isDefault: false }, {
      where: { c_id }
    });
    
    // Set this address as default
    await Address.update({ isDefault: true }, {
      where: { address_id: req.params.address_id }
    });
    
    res.json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Error setting default address', error: error.message });
  }
});

module.exports = router;
