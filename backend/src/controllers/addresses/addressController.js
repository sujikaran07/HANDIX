const { Address } = require('../../models/addressModel');

// Get all addresses for a specific customer
const getAddressesByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.c_id;
    const addresses = await Address.findAll({
      where: { c_id: customerId }
    });
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

// Create a new address
const createAddress = async (req, res) => {
  try {
    const address = await Address.create(req.body);
    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
};

// Update address for a customer, or create if not exists
const updateAddress = async (req, res) => {
  try {
    const { c_id } = req.params;
    const addressData = req.body;

    const [existingAddress] = await Address.findAll({
      where: { c_id: c_id },
      limit: 1
    });
    
    if (existingAddress) {
      await Address.update(addressData, {
        where: { address_id: existingAddress.address_id }
      });
      const updatedAddress = await Address.findByPk(existingAddress.address_id);
      res.json(updatedAddress);
    } else {
      const newAddress = await Address.create({
        ...addressData,
        c_id: c_id
      });
      res.status(201).json(newAddress);
    }
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

module.exports = {
  getAddressesByCustomerId,
  createAddress,
  updateAddress
};
