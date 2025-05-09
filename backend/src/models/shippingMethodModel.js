const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShippingMethod = sequelize.define('ShippingMethod', {
  shipping_method_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'shipping_method_id' 
  },
  method_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'method_name' 
  },
  
}, {
  tableName: 'ShippingMethods',
  timestamps: false, 
  underscored: true
});
const initializeShippingMethods = async () => {
  try {
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
    

  } catch (error) {
    console.error('Error initializing shipping methods:', error);
  }
};

module.exports = { ShippingMethod, initializeShippingMethods };
