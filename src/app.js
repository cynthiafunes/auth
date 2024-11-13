const express = require('express');
const { sequelize, conn } = require('./config/database');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use('/', authRoutes);

const start = async () => {
  try {
    await conn();
        await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`Server running on port  ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();