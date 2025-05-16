const { Discount } = require('../../models/discountModel');
const { Customer } = require('../../models/customerModel');

// Get all discounts
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      include: [{ model: Customer, as: 'customer', attributes: ['c_id', 'first_name', 'last_name', 'business_name', 'account_type'] }]
    });
    return res.status(200).json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get discount by ID
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id, {
      include: [{ model: Customer, as: 'customer', attributes: ['c_id', 'first_name', 'last_name', 'business_name', 'account_type'] }]
    });
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    return res.status(200).json(discount);
  } catch (error) {
    console.error('Error fetching discount:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get discounts by customer ID
exports.getDiscountsByCustomerId = async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      where: { c_id: req.params.customerId }
    });
    
    return res.status(200).json(discounts);
  } catch (error) {
    console.error('Error fetching customer discounts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new discount
exports.createDiscount = async (req, res) => {
  try {
    const { c_id, account_type, min_order_value, max_order_value, discount_percent, is_base_discount } = req.body;
    
    // Validate customer exists
    const customer = await Customer.findByPk(c_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const newDiscount = await Discount.create({
      c_id,
      account_type,
      min_order_value,
      max_order_value,
      discount_percent,
      is_base_discount: is_base_discount || false
    });
    
    return res.status(201).json(newDiscount);
  } catch (error) {
    console.error('Error creating discount:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { min_order_value, max_order_value, discount_percent, is_base_discount } = req.body;
    
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    await discount.update({
      min_order_value: min_order_value || discount.min_order_value,
      max_order_value: max_order_value || discount.max_order_value,
      discount_percent: discount_percent || discount.discount_percent,
      is_base_discount: is_base_discount !== undefined ? is_base_discount : discount.is_base_discount
    });
    
    return res.status(200).json(discount);
  } catch (error) {
    console.error('Error updating discount:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    await discount.destroy();
    return res.status(200).json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
