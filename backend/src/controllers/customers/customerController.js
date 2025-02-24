const { Customer } = require('../../models/customerModel');  


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
    const customer = await Customer.findByPk(req.params.c_id);  
    if (customer) {
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
    console.log('Creating customer with data:', req.body); 
    if (req.body.accountType === 'Retail') {
      req.body.accountStatus = 'Approved';
    }
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);  
  } catch (error) {
    console.error('Error creating customer:', error);  
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Email or C-ID already exists' });
    } else {
      res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
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

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  approveCustomer,
  rejectCustomer
};
