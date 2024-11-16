const express = require('express');
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth');
const checkRole = require('../middleware/checkRole');
const User = require('../models/User');
const Role = require('../models/Role');

const checkAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return jwtAuth(req, res, next);}
  if (req.session && req.session.userId) {
    return next();}
    return res.status(401).json({ message: 'No has iniciado sesión' });
};

  router.get('/user-profile', checkAuth, checkRole('user'), (req, res) => {
    if (req.user) {
      return res.json({ 
        message: 'Perfil de usuario accedido',
        data: {
          email: req.user.email,
          role: req.user.role
        }
      });
    }
    return res.json({ 
      message: 'Perfil de usuario accedido',
      data: {
        id: req.session.userId,
        role: req.session.userRole
      }
    });
  });

router.get('/admin-dashboard', jwtAuth, checkRole('admin'), (req, res) => {
  res.json({ 
    message: 'Dashboard de asministrador accedido',
    data: {
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.get('/users-list', jwtAuth, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'createdAt'],
      include: Role
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener lista de usuarios' });
  }
});

module.exports = router;