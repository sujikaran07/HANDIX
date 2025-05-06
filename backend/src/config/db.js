const { Sequelize } = require('sequelize');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const encodedPassword = encodeURIComponent(DB_PASSWORD);
const DATABASE_URL = `postgres://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false  
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
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
