const express = require('express');
const { sequelize, conn } = require('./config/database');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const initRoles = require('./config/initRoles');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const protectedRoutes = require('./routes/protected');
const xssClean = require('xss-clean');
const csrf = require('csurf');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(xssClean());

app.use(session({
  secret: process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    domain: process.env.DOMAIN || 'localhost'
  }
}));

const csrfMiddleware = csrf();
app.use(csrfMiddleware);

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Error de token CSRF' });
  }
  next(err);
});

app.get('/csrf-token', (req, res) => {
  res.json({ token: req.csrfToken() });
});

app.use('/', authRoutes);
app.use('/protected', protectedRoutes);

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