const { Customer } = require('../../models/customerModel');  
const { Address } = require('../../models/addressModel');
const { Order } = require('../../models/orderModel');

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['c_id', 'ASC']] 
    });
    res.json(customers);  
  } catch (error) {
    console.error('Error fetching customers:', error);  
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.c_id, {
      include: [
        { model: Address, as: 'addresses' }, 
        { model: Order, as: 'customerOrders' } 
      ]
    });

    if (customer) {
      
      const billingOrShippingAddress = customer.addresses?.[0];
      customer.country = billingOrShippingAddress?.country || 'N/A';
      customer.registrationDate = customer.createdAt;
      customer.totalSpent = customer.customerOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toFixed(2);
      customer.orders = customer.customerOrders?.length || 0;
      customer.lastOrderDate = customer.customerOrders?.[0]?.order_date || 'N/A';

      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Ensure country consistency between Customer and Address
    if (customerData.addresses && customerData.addresses.length > 0) {
      customerData.country = customerData.addresses[0].country; // Set Customer country to match the first address
    }

    const customer = await Customer.create(customerData, { include: [{ model: Address, as: 'addresses' }] });
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { c_id: req.params.c_id }  
    });

    if (updated) {
      
      const updatedCustomer = await Customer.findByPk(req.params.c_id);
      res.json(updatedCustomer);  
    } else {
      res.status(404).json({ message: 'Customer not found' });  
    }
  } catch (error) {
    console.error('Error updating customer:', error);  
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { c_id: req.params.c_id }  
    });
    if (deleted) {
      res.status(204).json();  
    } else {
      res.status(404).json({ message: 'Customer not found' });  
    }
  } catch (error) {
    console.error('Error deleting customer:', error);  
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};

const approveCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update({ accountStatus: 'Approved' }, {
      where: { c_id: req.params.c_id }
    });

    if (updated) {
      const updatedCustomer = await Customer.findByPk(req.params.c_id);
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error approving customer:', error);
    res.status(500).json({ message: 'Error approving customer', error: error.message });
  }
};

const rejectCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update({ accountStatus: 'Rejected' }, {
      where: { c_id: req.params.c_id }
    });

    if (updated) {
      const updatedCustomer = await Customer.findByPk(req.params.c_id);
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error rejecting customer:', error);
    res.status(500).json({ message: 'Error rejecting customer', error: error.message });
  }
};

const getAllCustomersWithDetails = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        { model: Address, as: 'addresses' }, // Include related addresses
        { model: Order, as: 'customerOrders' } // Include related orders
      ],
      order: [['c_id', 'ASC']]
    });
    console.log('Fetched customers with details:', JSON.stringify(customers, null, 2)); // Log the fetched data
    res.json(customers); // Send the fetched data as JSON
  } catch (error) {
    console.error('Error fetching customers with details:', error);
    res.status(500).json({ message: 'Error fetching customers with details', error: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  approveCustomer,
  rejectCustomer,
  getAllCustomersWithDetails
};
