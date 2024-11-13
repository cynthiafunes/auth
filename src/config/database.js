const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

const conn = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB conn working');
  } catch (error) {
    console.log('DB conn failed:', error);
  }
};

module.exports = {
  sequelize,
  conn
};