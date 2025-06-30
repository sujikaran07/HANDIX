const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get DB connection variables from environment
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Encode password for URL safety
const encodedPassword = encodeURIComponent(DB_PASSWORD);

// Build PostgreSQL connection URL
const DATABASE_URL = `postgres://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Initialize Sequelize instance
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate(); // Test DB connection
    console.log('PostgreSQL connected');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { 
  sequelize, 
  Sequelize,
  connectToDatabase 
};
