const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShippingMethod = sequelize.define('ShippingMethod', {
  shipping_method_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'shipping_method_id' // Match the actual column name in the database
  },
  method_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'method_name' // Match the actual column name in the database
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price'
  }
}, {
  tableName: 'ShippingMethods',
  timestamps: false, // No timestamp fields in the schema
  underscored: true
});

// Function to initialize default shipping methods
const initializeShippingMethods = async () => {
  try {
    // First check if the table exists
    const tableExists = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ShippingMethods'
      )`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (!tableExists[0].exists) {
      console.log('ShippingMethods table does not exist yet. Will be created during sync.');
      return;
    }
    
    const count = await ShippingMethod.count();
    
    // Only insert default methods if table is empty
    if (count === 0) {
      await ShippingMethod.bulkCreate([
        {
          method_name: 'Standard Delivery',
          price: 350.00
        },
        {
          method_name: 'Express Delivery',
          price: 500.00
        },
        {
          method_name: 'Store Pickup',
          price: 0.00
        }
      ]);
      console.log('Default shipping methods created');
    }
  } catch (error) {
    console.error('Error initializing shipping methods:', error);
  }
};

module.exports = { ShippingMethod, initializeShippingMethods };
