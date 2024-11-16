const express = require('express');
const { sequelize, conn } = require('./config/database');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const initRoles = require('./config/initRoles');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());
app.use('/', authRoutes);

const start = async () => {
  try {
    await conn();
    await sequelize.sync();
    await initRoles();
    
    app.listen(PORT, () => {
      console.log(`Server running on port  ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();